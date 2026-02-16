import { Router } from 'express';
import { getPool } from '../../db';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/admin';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /api/admin/users/count
 * Returns the total count of users in the system.
 */
router.get('/count', async (req, res) => {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
        const [[result]]: any = await conn.query('SELECT COUNT(*) as count FROM users');
        res.json({ count: result.count || 0 });
    } catch (e: any) {
        console.error('Failed to fetch user count:', e);
        res.status(500).json({ error: 'fetch_count_failed' });
    } finally {
        conn.release();
    }
});

/**
 * GET /api/admin/users
 * Returns a list of all users.
 */
router.get('/', async (req, res) => {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
        const [rows]: any = await conn.query('SELECT id, email, name, phone, isAdmin, createdAt FROM users ORDER BY createdAt DESC');
        res.json(rows);
    } catch (e: any) {
        console.error('Failed to fetch users:', e);
        res.status(500).json({ error: 'fetch_users_failed' });
    } finally {
        conn.release();
    }
});

export default router;
