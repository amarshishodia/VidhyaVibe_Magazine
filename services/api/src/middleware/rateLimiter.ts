import rateLimit from 'express-rate-limit';
import { getEnv } from '@magazine/config';

const env = getEnv();

export const loginRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: Number(env.RATE_LIMIT_MAX || '5'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' }
});

