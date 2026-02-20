#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function run() {
  const sqlPath = path.join(
    __dirname,
    'prisma/migrations/0015_delivery_mode_pricing/migration.sql',
  );
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const stmts = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('--'));
    for (let i = 0; i < stmts.length; i++) {
      await conn.query(stmts[i]);
      console.log('Migration 0015: statement', i + 1, 'OK');
    }
    console.log('Migration 0015 applied successfully.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}
run();
