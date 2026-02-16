import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';
import { getPool } from '../../db';
import { verifyProof } from '../../services/payments';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

router.get('/orders/pending', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT * FROM payment_orders WHERE status = ? ORDER BY created_at DESC', ['PENDING']);
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  } finally {
    conn.release();
  }
});

router.get('/proofs/pending', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT p.*, o.final_cents FROM payment_proofs p JOIN payment_orders o ON p.order_id = o.id WHERE p.verified = 0 ORDER BY p.created_at DESC');
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  } finally {
    conn.release();
  }
});

router.post('/proofs/:id/verify', async (req, res) => {
  const proofId = Number(req.params.id);
  const adminId = Number((req as any).user?.id);
  try {
    const result = await verifyProof(proofId, adminId);
    res.json({ ok: true, result });
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: 'verify_failed', message: e.message });
  }
});

export default router;

