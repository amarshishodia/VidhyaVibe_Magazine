import { getEnv } from '@magazine/config';
import rateLimit from 'express-rate-limit';

const env = getEnv();

export const loginRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS || '900000'),
  // Use a separate LOGIN_RATE_LIMIT_MAX so it is not confused with the
  // general RATE_LIMIT_MAX (which defaults to 1000).  Default: 10 attempts
  // per window, which is strict enough to deter brute force but allows
  // genuine users who mistype their password a few times.
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || '10'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' },
});
