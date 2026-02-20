import { getEnv } from '@magazine/config';
import mysql from 'mysql2/promise';

const env = getEnv();

let pool: mysql.Pool | null = null;

export function getPool() {
  if (pool) return pool;
  const u = new URL(env.DATABASE_URL);
  pool = mysql.createPool({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: u.username,
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
  });
  return pool;
}
