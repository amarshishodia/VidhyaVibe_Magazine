import pino from 'pino';

export function createLogger(name = 'magazine') {
  return pino({
    name,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    timestamp: pino.stdTimeFunctions.isoTime
  });
}

export type Logger = ReturnType<typeof createLogger>;

