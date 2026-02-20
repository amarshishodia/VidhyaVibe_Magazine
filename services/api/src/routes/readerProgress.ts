import { Router } from 'express';
import { getPool } from '../db';
import type { AuthRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// Get progress for reader+edition
router.get('/:readerId/edition/:editionId', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const readerId = Number(req.params.readerId);
  const editionId = Number(req.params.editionId);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  // ensure reader belongs to user
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rRows]: any = await conn.query(
      'SELECT id FROM readers WHERE id = ? AND userId = ? LIMIT 1',
      [readerId, userId],
    );
    if (!rRows[0]) return res.status(403).json({ error: 'forbidden' });
    const [rows]: any = await conn.query(
      'SELECT currentPage, percent, updatedAt FROM reader_progress WHERE readerId = ? AND editionId = ? LIMIT 1',
      [readerId, editionId],
    );
    const p = rows[0] || null;
    res.json(p);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'get_failed' });
  } finally {
    conn.release();
  }
});

// Upsert progress
router.post('/:readerId/progress', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const readerId = Number(req.params.readerId);
  const { editionId, currentPage, percent } = req.body;
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  if (!editionId) return res.status(400).json({ error: 'editionId_required' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rRows]: any = await conn.query(
      'SELECT id FROM readers WHERE id = ? AND userId = ? LIMIT 1',
      [readerId, userId],
    );
    if (!rRows[0]) return res.status(403).json({ error: 'forbidden' });
    // upsert
    const [up]: any = await conn.query(
      'INSERT INTO reader_progress (readerId, editionId, currentPage, percent, updatedAt) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE currentPage = VALUES(currentPage), percent = VALUES(percent), updatedAt = NOW()',
      [readerId, editionId, currentPage || null, percent || null],
    );
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'save_failed' });
  } finally {
    conn.release();
  }
});

export default router;
