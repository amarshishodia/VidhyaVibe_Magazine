import { Router } from 'express';
import { getPool } from '../../db';
import { requireAdmin } from '../../middleware/admin';
import { requireAuth } from '../../middleware/auth';
import { getStorageAdapter } from '../../providers/storage';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

router.post('/:magazineId/editions/presign', async (req, res) => {
  const magazineId = Number(req.params.magazineId);
  const { filename, contentType } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename_required' });
  try {
    const storage = getStorageAdapter();
    const key = `magazines/${magazineId}/editions/${Date.now()}-${filename}`;
    // presignUpload may not be implemented by all adapters
    // @ts-ignore
    if (!storage.presignUpload) return res.status(400).json({ error: 'presign_not_supported' });
    // @ts-ignore
    const { url, key: k } = await storage.presignUpload(
      key,
      contentType || 'application/octet-stream',
    );
    res.json({ url, key: k });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'presign_failed' });
  }
});

export default router;
