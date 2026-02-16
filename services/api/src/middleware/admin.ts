import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.isAdmin) return next();
  return res.status(403).json({ error: 'admin_required' });
}

