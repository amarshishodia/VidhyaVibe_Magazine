import type { Env, Logger } from '@magazine/config';
import * as Minio from 'minio';

export function createMinioAdapter(env: Env, ctx: { logger: Logger }) {
  const raw = (env.STORAGE_ENDPOINT || '127.0.0.1:9000').replace(/^https?:\/\//, '');
  const [host, portStr] = raw.split(':');
  const port = portStr ? parseInt(portStr, 10) : 9000;
  const client = new Minio.Client({
    endPoint: host,
    port,
    useSSL: false,
    accessKey: env.STORAGE_ACCESS_KEY || '',
    secretKey: env.STORAGE_SECRET_KEY || '',
  });

  async function ensureBucket(bucket: string) {
    try {
      const exists = await client.bucketExists(bucket);
      if (!exists) await client.makeBucket(bucket, 'us-east-1');
    } catch (e) {
      ctx.logger.error({ err: e }, 'MinIO bucket ensure failed');
      throw e;
    }
  }

  return {
    async upload(key: string, buffer: Buffer) {
      const bucket = env.STORAGE_BUCKET || 'magazine';
      await ensureBucket(bucket);
      await client.putObject(bucket, key, buffer);
      const url = `${env.STORAGE_ENDPOINT}/${bucket}/${key}`;
      return { url, key };
    },
    async get(key: string) {
      const bucket = env.STORAGE_BUCKET || 'magazine';
      const stream = await client.getObject(bucket, key);
      return stream;
    },
    async presignGet(key: string, expiresSec = 900) {
      const bucket = env.STORAGE_BUCKET || 'magazine';
      // minio client.presignedUrl -> presignedGetObject
      const url = await client.presignedGetObject(bucket, key, expiresSec);
      return { url, key };
    },
  };
}
