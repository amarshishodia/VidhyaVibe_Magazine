import { Router } from 'express';
import { getPool } from '../../db';
import { requireAdmin } from '../../middleware/admin';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /api/admin/readers
 * List all readers with user (email) info.
 */
router.get('/', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query(`
      SELECT r.id, r.userId, r.name, r.dob, r.deliveryMode, r.age, r.className, r.schoolName, r.schoolCity, r.parentPermissionRequired, r.createdAt,
             u.email as userEmail, u.name as userName
      FROM readers r
      LEFT JOIN users u ON u.id = r.userId
      ORDER BY r.createdAt DESC
    `);
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_readers_failed' });
  } finally {
    conn.release();
  }
});

export default router;
