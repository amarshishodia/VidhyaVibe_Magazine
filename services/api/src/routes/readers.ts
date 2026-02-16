import { Router } from 'express';
import { getPool } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication
router.use(requireAuth);

// Create reader (multiple readers per user allowed)
router.post('/', async (req: AuthRequest, res) => {
  const { name, dob, deliveryMode, age, className, schoolName, schoolCity, parentPermissionRequired } = req.body;
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  if (!name) return res.status(400).json({ error: 'name_required' });

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [result]: any = await conn.query(
      `INSERT INTO readers (userId, name, dob, deliveryMode, age, className, schoolName, schoolCity, parentPermissionRequired, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        name,
        dob ? new Date(dob) : null,
        deliveryMode || 'ELECTRONIC',
        age || null,
        className || null,
        schoolName || null,
        schoolCity || null,
        parentPermissionRequired ? 1 : 0
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'create_reader_failed' });
  } finally {
    conn.release();
  }
});

// List readers for current user
router.get('/', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT id, userId, name, dob, deliveryMode, age, className, schoolName, schoolCity, parentPermissionRequired, createdAt, updatedAt FROM readers WHERE userId = ?', [userId]);
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_readers_failed' });
  } finally {
    conn.release();
  }
});

// Get single reader
router.get('/:id', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const id = Number(req.params.id);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query('SELECT id, userId, name, dob, deliveryMode, age, className, schoolName, schoolCity, parentPermissionRequired, createdAt, updatedAt FROM readers WHERE id = ? AND userId = ? LIMIT 1', [id, userId]);
    const reader = rows[0];
    if (!reader) return res.status(404).json({ error: 'not_found' });
    res.json(reader);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'get_reader_failed' });
  } finally {
    conn.release();
  }
});

// Update reader
router.put('/:id', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const id = Number(req.params.id);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  const { name, dob, deliveryMode, age, className, schoolName, schoolCity, parentPermissionRequired } = req.body;
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [resu]: any = await conn.query(
      `UPDATE readers SET name = ?, dob = ?, deliveryMode = ?, age = ?, className = ?, schoolName = ?, schoolCity = ?, parentPermissionRequired = ?, updatedAt = NOW() WHERE id = ? AND userId = ?`,
      [name || null, dob ? new Date(dob) : null, deliveryMode || 'ELECTRONIC', age || null, className || null, schoolName || null, schoolCity || null, parentPermissionRequired ? 1 : 0, id, userId]
    );
    if (resu.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'update_reader_failed' });
  } finally {
    conn.release();
  }
});

// Delete reader
router.delete('/:id', async (req: AuthRequest, res) => {
  const userId = Number(req.user?.id);
  const id = Number(req.params.id);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [r]: any = await conn.query('DELETE FROM readers WHERE id = ? AND userId = ?', [id, userId]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ deleted: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'delete_reader_failed' });
  } finally {
    conn.release();
  }
});

export default router;

