import { Router } from 'express';
import { getPool } from '../db';

const router = Router();

// Public endpoint to list all active magazines with optional category filtering
router.get('/', async (req, res) => {
    const { category } = req.query;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
        let query = 'SELECT id, title, slug, publisher, description, category, active, coverKey, createdAt FROM magazines WHERE active = 1';
        const params: any[] = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY createdAt DESC';

        const [rows]: any = await conn.query(query, params);
        res.json(rows);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: 'list_failed', details: e.message });
    } finally {
        conn.release();
    }
});

// Public endpoint to get a single magazine by slug or ID
router.get('/:identifier', async (req, res) => {
    const identifier = req.params.identifier;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
        // Try to parse as ID first, otherwise treat as slug
        const isNumeric = /^\d+$/.test(identifier);
        const query = isNumeric
            ? 'SELECT id, title, slug, publisher, description, category, active FROM magazines WHERE id = ? LIMIT 1'
            : 'SELECT id, title, slug, publisher, description, category, active FROM magazines WHERE slug = ? LIMIT 1';

        const [rows]: any = await conn.query(query, [identifier]);
        const magazine = rows[0];

        if (!magazine) {
            return res.status(404).json({ error: 'magazine_not_found' });
        }

        res.json(magazine);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: 'get_failed' });
    } finally {
        conn.release();
    }
});

export default router;
