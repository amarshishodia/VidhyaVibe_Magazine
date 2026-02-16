import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getStorageAdapter } from '../providers/storage';

const router = Router();

// Presign GET URL for a storage key (requires auth)
router.get('/presign', requireAuth, async (req, res) => {
  const { key, expires } = req.query;
  if (!key) return res.status(400).json({ error: 'key_required' });
  const storage = getStorageAdapter();
  if (!storage.presignGet) return res.status(400).json({ error: 'presign_not_supported' });
  try {
    // @ts-ignore
    const { url, key: k } = await storage.presignGet(String(key), Number(expires || 900));
    res.json({ url, key: k });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'presign_failed', message: e.message });
  }
});

// Serve local files (only for local storage provider)
router.get('/serve', async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key_required' });

  const storage = getStorageAdapter();
  if (!storage.get) return res.status(400).json({ error: 'get_not_supported' });

  try {
    const buffer = await storage.get(String(key));
    if (!buffer) return res.status(404).json({ error: 'not_found' });

    // basic mime detection
    const ext = String(key).split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (['jpg', 'jpeg'].includes(ext!)) contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';

    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'serve_failed' });
  }
});

export default router;

