import type { Logger } from '@magazine/config';
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(logger: Logger) {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    const status = err?.statusCode || 500;
    res.status(status).json({
      error: {
        message: err?.message || 'Internal Server Error',
        code: err?.code || 'INTERNAL_ERROR',
      },
    });
  };
}
