import bcrypt from 'bcryptjs';
import { getEnv } from '@magazine/config';

const env = getEnv();
const saltRounds = Number(env.BCRYPT_SALT_ROUNDS || '10');

export async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hash: string) {
  return await bcrypt.compare(plain, hash);
}

