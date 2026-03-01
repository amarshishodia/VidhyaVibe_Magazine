import { getEnv } from '@magazine/config';
import cookieParser from 'cookie-parser';
import { Router } from 'express';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../auth/jwt';
import { hashPassword, comparePassword } from '../auth/password';
import { getPool } from '../db';
import { loginRateLimiter } from '../middleware/rateLimiter';

const env = getEnv();
const router = Router();

router.use(cookieParser());

// Parent registration: create user + at least one guardian
router.post('/register', async (req, res) => {
  const { email, password, name, phone, guardians } = req.body;
  if (!email || !password || !guardians || !Array.isArray(guardians) || guardians.length === 0) {
    return res.status(400).json({ error: 'email, password and at least one guardian required' });
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [uRes]: any = await conn.query(
      'INSERT INTO users (email, name, phone) VALUES (?, ?, ?)',
      [email, name || null, phone || null],
    );
    const userId = uRes.insertId;
    let primaryGuardianId: number | null = null;
    for (let i = 0; i < guardians.length; i++) {
      const g = guardians[i];
      const [gRes]: any = await conn.query(
        'INSERT INTO guardians (userId, name, phone, relation) VALUES (?, ?, ?, ?)',
        [userId, g.name, g.phone || null, g.relation || null],
      );
      if (i === 0) primaryGuardianId = gRes.insertId;
    }
    // set primary guardian
    if (primaryGuardianId) {
      await conn.query('UPDATE users SET primaryGuardianId = ? WHERE id = ?', [
        primaryGuardianId,
        userId,
      ]);
    }
    // store password hash in a separate auth table (simple)
    const passwordHash = await hashPassword(password);
    await conn.query(
      'CREATE TABLE IF NOT EXISTS user_auth (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNIQUE, password_hash VARCHAR(255), created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
      [],
    );
    await conn.query('INSERT INTO user_auth (user_id, password_hash) VALUES (?, ?)', [
      userId,
      passwordHash,
    ]);

    await conn.commit();
    res.status(201).json({ id: userId, email });
  } catch (e: any) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'registration_failed', details: e.message });
  } finally {
    conn.release();
  }
});

// Login
router.post('/login', loginRateLimiter, async (req, res) => {
  const { email, password, deviceName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query(
      'SELECT id, email, isAdmin FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const [authRows]: any = await conn.query(
      'SELECT password_hash FROM user_auth WHERE user_id = ? LIMIT 1',
      [user.id],
    );
    const auth = authRows[0];
    if (!auth) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await comparePassword(password, auth.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    // create session and refresh token
    const ua = req.headers['user-agent'];
    const userAgent = ua ? String(ua).substring(0, 1000) : null;
    const [sessionRes] = await conn.query<any>(
      'INSERT INTO sessions (userId, deviceName, ipAddress, userAgent, refreshJti, createdAt) VALUES (?, ?, ?, ?, ?, NOW(3))',
      [user.id, deviceName || null, req.ip || null, userAgent, null],
    );
    const sessionId = sessionRes.insertId;

    // include role in access token
    const role = user.isAdmin ? 'admin' : 'user';
    const access = signAccessToken({ sub: user.id, role });
    const { token: refreshToken, jti } = signRefreshToken({ sub: user.id });

    // store jti in session
    await conn.query('UPDATE sessions SET refreshJti = ? WHERE id = ?', [jti, sessionId]);

    // set refresh token cookie (httpOnly)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.json({
      access_token: access,
      token_type: 'bearer',
      expires_in: 15 * 60,
      user: { id: user.id, email: user.email, isAdmin: !!user.isAdmin },
    });
  } catch (e: any) {
    console.error('Login error:', e);
    res.status(500).json({
      error: 'login_failed',
      ...(env.NODE_ENV === 'development' && { details: e?.message }),
    });
  } finally {
    conn.release();
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const refreshToken = req.cookies['refresh_token'] || req.body.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: 'missing_refresh' });
    const payload: any = verifyRefreshToken(refreshToken);
    const jti = payload.jti;
    // find session with jti
    const [rows]: any = await conn.query(
      'SELECT id, userId FROM sessions WHERE refreshJti = ? LIMIT 1',
      [jti],
    );
    const session = rows[0];
    if (!session) return res.status(401).json({ error: 'invalid_session' });

    // Fetch user role so the refreshed access token carries the correct role
    const [userRows]: any = await conn.query('SELECT isAdmin FROM users WHERE id = ? LIMIT 1', [
      session.userId,
    ]);
    const user = userRows[0];
    const role = user?.isAdmin ? 'admin' : 'user';

    const access = signAccessToken({ sub: session.userId, role });
    res.json({ access_token: access, token_type: 'bearer', expires_in: 15 * 60 });
  } catch (e: any) {
    console.error(e);
    res.status(401).json({ error: 'invalid_refresh' });
  } finally {
    conn.release();
  }
});

// logout
router.post('/logout', async (req, res) => {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const refreshToken = req.cookies['refresh_token'] || req.body.refresh_token;
    if (refreshToken) {
      try {
        const payload: any = verifyRefreshToken(refreshToken);
        const jti = payload.jti;
        await conn.query('DELETE FROM sessions WHERE refreshJti = ?', [jti]);
      } catch (e) {
        // ignore invalid token
      }
    }
    res.clearCookie('refresh_token');
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'logout_failed' });
  } finally {
    conn.release();
  }
});

// current user - accepts Bearer access token OR refresh cookie
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    if (auth) {
      const parts = auth.split(' ');
      if (parts.length !== 2) return res.status(401).json({ error: 'invalid_auth' });
      const token = parts[1];
      try {
        const payload: any = verifyAccessToken(token);
        const userId = Number(payload.sub);
        const [rows]: any = await conn.query(
          'SELECT id, email, name, phone, isAdmin FROM users WHERE id = ? LIMIT 1',
          [userId],
        );
        const u = rows[0];
        if (!u) return res.status(404).json({ error: 'user_not_found' });
        return res.json({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          isAdmin: !!u.isAdmin,
        });
      } catch (e: any) {
        return res.status(401).json({ error: 'invalid_token' });
      }
    }

    // fallback to refresh cookie
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) return res.status(401).json({ error: 'missing_auth' });
    try {
      const payload: any = verifyRefreshToken(refreshToken);
      const jti = payload.jti;
      const [sessions]: any = await conn.query(
        'SELECT userId FROM sessions WHERE refreshJti = ? LIMIT 1',
        [jti],
      );
      const session = sessions[0];
      if (!session) return res.status(401).json({ error: 'invalid_session' });
      const userId = session.userId;
      const [rows]: any = await conn.query(
        'SELECT id, email, name, phone, isAdmin FROM users WHERE id = ? LIMIT 1',
        [userId],
      );
      const u = rows[0];
      if (!u) return res.status(404).json({ error: 'user_not_found' });
      return res.json({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        isAdmin: !!u.isAdmin,
      });
    } catch (e: any) {
      return res.status(401).json({ error: 'invalid_refresh' });
    }
  } finally {
    conn.release();
  }
});

// Update current user profile (name, phone)
router.put('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing_auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'invalid_auth' });
  const token = parts[1];
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const payload: any = verifyAccessToken(token);
    const userId = Number(payload?.sub);
    if (!userId) return res.status(401).json({ error: 'invalid_token' });
    const { name, phone } = req.body;
    await conn.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [
      name ?? null,
      phone ?? null,
      userId,
    ]);
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(401).json({ error: 'invalid_token' });
  } finally {
    conn.release();
  }
});

export default router;
