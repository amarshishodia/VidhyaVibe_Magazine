import { getEnv } from '@magazine/config';
import Redis from 'ioredis';

const env = getEnv();
let client: Redis | null = null;

export function getRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL || env.REDIS_URL;
  if (!url) {
    client = new Redis(); // default localhost
  } else {
    client = new Redis(url);
  }
  return client;
}

export async function cacheGet(key: string) {
  const r = getRedis();
  const v = await r.get(key);
  return v ? JSON.parse(v) : null;
}

export async function cacheSet(key: string, value: any, ttlSec?: number) {
  const r = getRedis();
  const s = JSON.stringify(value);
  if (ttlSec) await r.set(key, s, 'EX', ttlSec);
  else await r.set(key, s);
}
