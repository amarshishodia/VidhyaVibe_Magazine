const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const u = new URL(dbUrl);
  const user = u.username;
  const password = u.password;
  const host = u.hostname;
  const port = Number(u.port || 3306);
  const database = u.pathname.replace(/^\//, '');

  const sqlPath = path.resolve(__dirname, 'migrations/0001_init/migration.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('migration.sql not found at', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    // Ensure database exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    // Use database
    await conn.changeUser({ database });
    console.log('Applying migration SQL...');
    await conn.query(sql);
    console.log('Migration applied.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run();

