import { Env, Logger } from '@magazine/config';
import { createLocalStorageAdapter } from './providers/storage/local';
import { createMinioAdapter } from './providers/storage/minio';
import { createS3Adapter } from './providers/storage/s3';
import { registerStorageAdapter } from './providers/storage';

type Context = { logger: Logger };

export function registerAdapters(env: Env, ctx: Context) {
  // Storage provider
  switch (env.STORAGE_PROVIDER) {
    case 'minio':
      ctx.logger.info('Using MinIO storage adapter');
      registerStorageAdapter(createMinioAdapter(env, ctx));
      break;
    case 's3':
      ctx.logger.info('Using S3 storage adapter');
      registerStorageAdapter(createS3Adapter(env, ctx));
      break;
    default:
      ctx.logger.info('Using local storage adapter');
      registerStorageAdapter(createLocalStorageAdapter(env, ctx));
  }

  // Cache, DB adapters would be registered similarly (by env flags)
}

