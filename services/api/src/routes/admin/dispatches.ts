import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin';
import { requireAuth } from '../../middleware/auth';
import { assignEditionsToSchedules } from '../../services/dispatchScheduler';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

router.post('/assign', async (_req, res) => {
  try {
    const result = await assignEditionsToSchedules(500);
    res.json({ ok: true, result });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'assign_failed', message: e.message });
  }
});

// list dispatch schedules with optional status filter
router.get('/list', async (req, res) => {
  const { status } = req.query;
  const limit = Number(req.query.limit || 100);
  const pool = require('../../db').getPool();
  const conn = await pool.getConnection();
  try {
    let sql =
      'SELECT ds.*, us.userId, us.readerId, us.planId, us.magazineId FROM dispatch_schedules ds JOIN user_subscriptions us ON ds.subscriptionId = us.id';
    const params: any[] = [];
    if (status) {
      sql += ' WHERE ds.status = ?';
      params.push(String(status));
    }
    sql += ' ORDER BY ds.scheduledAt DESC LIMIT ?';
    params.push(limit);
    const [rows]: any = await conn.query(sql, params);
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  } finally {
    conn.release();
  }
});

// get single dispatch
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const pool = require('../../db').getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query(
      'SELECT ds.*, us.userId, us.readerId, us.planId, us.magazineId FROM dispatch_schedules ds JOIN user_subscriptions us ON ds.subscriptionId = us.id WHERE ds.id = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'not_found' });
    res.json(row);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'get_failed' });
  } finally {
    conn.release();
  }
});

// update dispatch (status, timestamps, courier tracking)
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { status, courierTrackingNumber, packedAt, shippedAt, deliveredAt, trackingNumber } =
    req.body;
  const pool = require('../../db').getPool();
  const conn = await pool.getConnection();
  try {
    const updates: string[] = [];
    const params: any[] = [];
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (typeof courierTrackingNumber !== 'undefined') {
      updates.push('courierTrackingNumber = ?');
      params.push(courierTrackingNumber);
    }
    if (typeof trackingNumber !== 'undefined') {
      updates.push('trackingNumber = ?');
      params.push(trackingNumber);
    }
    if (packedAt) {
      updates.push('packedAt = ?');
      params.push(packedAt);
    }
    if (shippedAt) {
      updates.push('shippedAt = ?');
      params.push(shippedAt);
    }
    if (deliveredAt) {
      updates.push('deliveredAt = ?');
      params.push(deliveredAt);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'no_updates' });
    const sql = `UPDATE dispatch_schedules SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);
    await conn.query(sql, params);
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'update_failed' });
  } finally {
    conn.release();
  }
});

export default router;
