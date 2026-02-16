import './dotenv-loader';
import express from 'express';
import { createLogger } from '@magazine/config';

import { json } from 'body-parser';

import { errorHandler } from './middleware/errorHandler';
import { registerAdapters } from './providers';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import readersRoutes from './routes/readers';
import adminMagazineRoutes from './routes/admin/magazine';
import adminMagazineListRoutes from './routes/admin/magazine-list';
import adminPresignRoutes from './routes/admin/presign';
import subscriptionsRoutes from './routes/subscriptions';
import adminCouponsRoutes from './routes/admin/coupons';
import paymentsRoutes from './routes/payments';
import adminPaymentsRoutes from './routes/admin/payments';
import editionsRoutes from './routes/editions';
import readerProgressRoutes from './routes/readerProgress';
import interactionsRoutes from './routes/interactions';
import adminDispatchesRoutes from './routes/admin/dispatches';
import adminDashboardRoutes from './routes/admin/dashboard';
import adminUsersRoutes from './routes/admin/users';
import magazinesRoutes from './routes/magazines';
import assetsRoutes from './routes/assets';
import { auditMiddleware } from './middleware/audit';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getEnv } from '@magazine/config';

const logger = createLogger('api');
const env = getEnv();

const app = express();
// Security headers
app.use(helmet());
app.use(json());
app.use(cookieParser());

// Global rate limiter
app.use(
  rateLimit({
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(env.RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Audit logging (after rate limiting)
app.use(auditMiddleware);

// Public routes (no auth required)
app.use('/api/magazines', magazinesRoutes);

// auth routes
app.use('/api/auth', authRoutes);
app.use('/api/readers', readersRoutes);
app.use('/api/admin/magazines', adminMagazineRoutes);
app.use('/api/admin/magazines', adminMagazineListRoutes);
app.use('/api/admin/magazines', adminPresignRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/admin/coupons', adminCouponsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/editions', editionsRoutes);
app.use('/api/reader-progress', readerProgressRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/admin/dispatches', adminDispatchesRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/assets', assetsRoutes);

// Register provider adapters (storage, cache, db) based on env
registerAdapters(env, { logger });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

// Central error handler
app.use(errorHandler(logger));

const port = Number(env.PORT || 4000);
app.listen(port, () => {
  logger.info(`API listening on ${port}`);
});

// Optional dispatch scheduler worker
if (process.env.RUN_DISPATCH_WORKER === 'true') {
  const { assignEditionsToSchedules } = require('./services/dispatchScheduler');
  const intervalMs = Number(process.env.DISPATCH_WORKER_INTERVAL_MS || 10 * 60 * 1000);
  logger.info({ intervalMs }, 'Starting dispatch scheduler worker');
  setInterval(async () => {
    try {
      const r = await assignEditionsToSchedules();
      logger.info({ result: r }, 'Dispatch scheduler run complete');
    } catch (e: any) {
      logger.error({ err: e }, 'Dispatch scheduler run failed');
    }
  }, intervalMs);
}

