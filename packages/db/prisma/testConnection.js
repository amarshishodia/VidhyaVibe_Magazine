const mysql = require('mysql2/promise');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const u = new URL(dbUrl);
  const user = u.username;
  const password = decodeURIComponent(u.password);
  const host = u.hostname;
  const port = Number(u.port || 3306);
  const database = u.pathname.replace(/^\//, '');

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });
    await conn.ping();
    console.log('OK - DB reachable');
    await conn.end();
  } catch (e) {
    console.error('DB connection failed:', e.message);
    process.exit(1);
  }
}

run();

