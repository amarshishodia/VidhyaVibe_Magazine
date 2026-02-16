import { Request, Response, NextFunction } from 'express';
import { getPool } from '../db';

export async function auditMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    const userId = (req as any).user?.id || null;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const body = req.method === 'GET' ? null : JSON.stringify(req.body || {});
    const ip = req.ip;
    const ua = req.headers['user-agent'] || '';
    // Fire-and-forget insert
    conn.query('INSERT INTO audit_logs (user_id, method, path, body, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [
      userId,
      method,
      path,
      body,
      ip,
      ua
    ]).catch(() => {
      // Table may not exist; ignore silently
    }).finally(() => conn.release());
  } catch (e) {
    // ignore
  } finally {
    next();
  }
}

