import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../db';
import type { AuthRequest } from '../../middleware/auth';
import { requireAuth } from '../../middleware/auth';
import { getStorageAdapter } from '../../providers/storage';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// simple admin guard - require auth + admin role
import { requireAdmin } from '../../middleware/admin';
router.use(requireAuth);
router.use(requireAdmin);

// Upload new edition with metadata: volume, issue, description, cover, magazine PDF, etc.
router.post(
  '/:magazineId/editions',
  upload.fields([
    { name: 'editionPdf', maxCount: 1 },
    { name: 'samplePdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  async (req: AuthRequest, res) => {
    const userId = Number(req.user?.id);
    const magazineId = Number(req.params.magazineId);
    if (!userId) return res.status(401).json({ error: 'unauthenticated' });
    const files = req.files as any;
    const { volume, issueNumber, description, pages, publishedAt, sku, publishNow } = req.body;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [mRows]: any = await conn.query('SELECT slug FROM magazines WHERE id = ? LIMIT 1', [
        magazineId,
      ]);
      const mag = mRows[0];
      if (!mag) return res.status(404).json({ error: 'magazine_not_found' });

      if (!files?.editionPdf?.[0]) return res.status(400).json({ error: 'edition_pdf_required' });

      const storage = getStorageAdapter();

      // upload edition PDF
      const buf = files.editionPdf[0].buffer as Buffer;
      const key = `magazines/${mag.slug}/editions/${uuidv4()}.pdf`;
      const uploaded = await storage.upload(key, buf, files.editionPdf[0].mimetype);
      const fileKey = uploaded.key;

      let sampleKey: string | null = null;
      if (files?.samplePdf?.[0]) {
        const sampleBuf = files.samplePdf[0].buffer as Buffer;
        const sampleKeyPath = `magazines/${mag.slug}/editions/${uuidv4()}-sample.pdf`;
        const sampleUploaded = await storage.upload(
          sampleKeyPath,
          sampleBuf,
          files.samplePdf[0].mimetype,
        );
        sampleKey = sampleUploaded.key;
      }

      let editionCoverKey: string | null = null;
      if (files?.cover?.[0]) {
        const coverBuf = files.cover[0].buffer as Buffer;
        const ext = (files.cover[0].originalname || 'jpg').split('.').pop() || 'jpg';
        const coverKeyPath = `magazines/${mag.slug}/editions/cover-${uuidv4()}.${ext}`;
        const coverUploaded = await storage.upload(coverKeyPath, coverBuf, files.cover[0].mimetype);
        editionCoverKey = coverUploaded.key;
      }

      const vol = volume != null && volume !== '' ? Number(volume) : null;
      const issue = issueNumber != null && issueNumber !== '' ? Number(issueNumber) : null;
      const pageCount = pages != null && pages !== '' ? Number(pages) : null;
      const desc =
        typeof description === 'string' && description.trim() ? description.trim() : null;
      const skuVal =
        typeof sku === 'string' && sku.trim()
          ? sku.trim()
          : vol != null && issue != null
            ? `${mag.slug}-v${vol}-i${issue}`
            : `SKU-${Date.now()}`;

      let pubAt: Date | null = null;
      if (publishNow === 'true' || publishNow === true) {
        pubAt = new Date();
      } else if (publishedAt && typeof publishedAt === 'string') {
        const parsed = new Date(publishedAt);
        if (!isNaN(parsed.getTime())) pubAt = parsed;
      }

      const [ins]: any = await conn.query(
        `INSERT INTO magazine_editions (magazineId, volume, issueNumber, sku, description, publishedAt, pages, coverKey, fileKey, sampleKey, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          magazineId,
          vol,
          issue,
          skuVal,
          desc,
          pubAt,
          pageCount,
          editionCoverKey,
          fileKey,
          sampleKey,
        ],
      );
      const newEditionId = ins.insertId;
      res.status(201).json({ id: newEditionId, fileKey, sampleKey, coverKey: editionCoverKey });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'upload_failed', details: e.message });
    } finally {
      conn.release();
    }
  },
);

// Attach video to a page number (upload file or provide URL)
router.post('/:editionId/videos', upload.single('videoFile'), async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const editionId = Number(req.params.editionId);
  const { pageNumber, url } = req.body;
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  if (!pageNumber) return res.status(400).json({ error: 'pageNumber_required' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const storage = getStorageAdapter();
    let finalUrl = url || null;
    if (req.file) {
      const key = `editions/${editionId}/videos/${uuidv4()}-${req.file.originalname}`;
      const uploaded = await storage.upload(key, req.file.buffer, req.file.mimetype);
      finalUrl = uploaded.url;
    }
    if (!finalUrl) return res.status(400).json({ error: 'video_file_or_url_required' });
    const [r]: any = await conn.query(
      'INSERT INTO edition_videos (editionId, pageNumber, url, public, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [editionId, Number(pageNumber), finalUrl, 1],
    );
    res.status(201).json({ id: r.insertId, url: finalUrl });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'attach_video_failed' });
  } finally {
    conn.release();
  }
});

// Publish control: set publishedAt or unset
router.post('/editions/:id/publish', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const id = Number(req.params.id);
  const { publish } = req.body; // true/false
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    if (publish) {
      await conn.query('UPDATE magazine_editions SET publishedAt = NOW() WHERE id = ?', [id]);
    } else {
      await conn.query('UPDATE magazine_editions SET publishedAt = NULL WHERE id = ?', [id]);
    }
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'publish_failed' });
  } finally {
    conn.release();
  }
});

export default router;
