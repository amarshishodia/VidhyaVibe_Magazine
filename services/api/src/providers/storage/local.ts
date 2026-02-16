import path from 'path';
import fs from 'fs-extra';
import { Env, Logger } from '@magazine/config';

export function createLocalStorageAdapter(env: Env, ctx: { logger: Logger }) {
  const base = path.resolve(process.cwd(), 'storage');
  fs.ensureDirSync(base);
  ctx.logger.info({ base }, 'Local storage base directory created/ensured');

  return {
    async upload(key: string, buffer: Buffer) {
      const filePath = path.join(base, key);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, buffer);
      return { url: `/api/assets/serve?key=${key}`, key };
    },
    async get(key: string) {
      const filePath = path.join(base, key);
      if (!(await fs.pathExists(filePath))) return null;
      return fs.readFile(filePath);
    },
    async presignGet(key: string) {
      return { url: `/api/assets/serve?key=${key}`, key };
    }
  };
}

