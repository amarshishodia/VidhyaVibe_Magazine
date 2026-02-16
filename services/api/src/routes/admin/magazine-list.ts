import { Router } from 'express';
import multer from 'multer';
import { getPool } from '../../db';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { getStorageAdapter } from '../../providers/storage';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

router.get('/list', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT id, title, slug, coverKey FROM magazines ORDER BY createdAt DESC');
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  } finally {
    conn.release();
  }
});

router.post('/', upload.single('cover'), async (req, res) => {
  const { title, slug, publisher, description, category } = req.body;
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    let coverKey: string | null = null;
    if (req.file) {
      const storage = getStorageAdapter();
      const ext = (req.file.originalname || 'jpg').split('.').pop() || 'jpg';
      const key = `magazines/${slug}/cover-${uuidv4()}.${ext}`;
      const uploaded = await storage.upload(key, req.file.buffer, req.file.mimetype);
      coverKey = uploaded.key;
    }

    const [r]: any = await conn.query(
      'INSERT INTO magazines (title, slug, publisher, description, category, coverKey, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [title, slug, publisher || null, description || null, category || null, coverKey]
    );
    res.status(201).json({ id: r.insertId, coverKey });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'create_failed' });
  } finally {
    conn.release();
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT id, title, slug, publisher, description, category, coverKey FROM magazines WHERE id = ? LIMIT 1', [id]);
    const mag = rows[0];
    if (!mag) return res.status(404).json({ error: 'not_found' });
    res.json(mag);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'get_failed' });
  } finally {
    conn.release();
  }
});

router.put('/:id', upload.single('cover'), async (req, res) => {
  const id = Number(req.params.id);
  const { title, slug, publisher, description, category } = req.body;
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // Check if exists
    const [existing]: any = await conn.query('SELECT coverKey FROM magazines WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'not_found' });

    let coverKey = existing[0].coverKey;
    if (req.file) {
      const storage = getStorageAdapter();
      const ext = (req.file.originalname || 'jpg').split('.').pop() || 'jpg';
      const key = `magazines/${slug}/cover-${uuidv4()}.${ext}`;
      const uploaded = await storage.upload(key, req.file.buffer, req.file.mimetype);
      coverKey = uploaded.key;
    }

    await conn.query(
      'UPDATE magazines SET title = ?, slug = ?, publisher = ?, description = ?, category = ?, coverKey = ? WHERE id = ?',
      [title, slug, publisher || null, description || null, category || null, coverKey, id]
    );
    res.json({ id, coverKey });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'update_failed' });
  } finally {
    conn.release();
  }
});

export default router;

