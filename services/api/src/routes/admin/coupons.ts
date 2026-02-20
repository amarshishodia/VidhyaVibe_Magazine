import { Router } from 'express';
import { getPool } from '../../db';
import { requireAdmin } from '../../middleware/admin';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

router.get('/list', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT * FROM coupons ORDER BY createdAt DESC');
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  } finally {
    conn.release();
  }
});

router.post('/', async (req, res) => {
  const {
    code,
    description,
    discountPct,
    discountCents,
    expiresAt,
    maxUses,
    perUserLimit,
    active,
    planId,
    magazineId,
  } = req.body;
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [r]: any = await conn.query(
      'INSERT INTO coupons (code, description, discountPct, discountCents, expiresAt, maxUses, perUserLimit, active, planId, magazineId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        code,
        description || null,
        discountPct || null,
        discountCents || null,
        expiresAt || null,
        maxUses || null,
        perUserLimit || null,
        active ? 1 : 0,
        planId || null,
        magazineId || null,
      ],
    );
    res.status(201).json({ id: r.insertId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'create_failed', details: e.message });
  } finally {
    conn.release();
  }
});

export default router;
