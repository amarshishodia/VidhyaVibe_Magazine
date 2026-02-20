import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt';
import { getPool } from '../db';

export async function requireEditionAccess(req: Request, res: Response, next: NextFunction) {
  const editionId = Number(req.params.editionId);
  if (!editionId) return res.status(400).json({ error: 'edition_id_required' });

  const auth = req.headers.authorization || (req.query?.token ? `Bearer ${req.query.token}` : null);
  if (!auth) return res.status(401).json({ error: 'authentication_required' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer')
    return res.status(401).json({ error: 'invalid_authorization' });

  let userId: number;
  try {
    const payload = verifyAccessToken(parts[1]) as any;
    userId = Number(payload?.sub);
  } catch (e) {
    return res.status(401).json({ error: 'invalid_or_expired_token' });
  }
  if (!userId) return res.status(401).json({ error: 'invalid_token' });

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [edRows]: any = await conn.query(
      'SELECT magazineId FROM magazine_editions WHERE id = ? LIMIT 1',
      [editionId],
    );
    const ed = edRows[0];
    if (!ed) return res.status(404).json({ error: 'edition_not_found' });

    // Admin bypass: admins can read any edition for review
    const [userRows]: any = await conn.query('SELECT isAdmin FROM users WHERE id = ? LIMIT 1', [
      userId,
    ]);
    if (userRows[0]?.isAdmin) return next();

    const magazineId = ed.magazineId;

    // Check purchase
    const [purchaseRows]: any = await conn.query(
      'SELECT id FROM edition_purchases WHERE userId = ? AND editionId = ? LIMIT 1',
      [userId, editionId],
    );
    if (purchaseRows.length > 0) return next();

    // Check subscription
    const [subRows]: any = await conn.query(
      'SELECT id FROM user_subscriptions WHERE userId = ? AND magazineId = ? AND status = ? AND (endsAt IS NULL OR endsAt > NOW()) LIMIT 1',
      [userId, magazineId, 'ACTIVE'],
    );
    if (subRows.length > 0) return next();

    return res
      .status(403)
      .json({ error: 'access_denied', message: 'Subscribe or purchase to read this edition' });
  } finally {
    conn.release();
  }
}
