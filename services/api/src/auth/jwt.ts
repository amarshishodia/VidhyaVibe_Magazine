import { getEnv } from '@magazine/config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const env = getEnv();
const accessSecret = env.JWT_ACCESS_SECRET || 'dev_access_secret';
const refreshSecret = env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const accessExpires = env.JWT_ACCESS_EXPIRES || '15m';
const refreshExpires = env.JWT_REFRESH_EXPIRES || '7d';

export function signAccessToken(payload: object) {
  return jwt.sign({ ...payload }, accessSecret, { expiresIn: accessExpires });
}

export function signRefreshToken(payload: object) {
  // include a jti for session tracking
  const jti = uuidv4();
  return {
    token: jwt.sign({ ...payload, jti }, refreshSecret, { expiresIn: refreshExpires }),
    jti,
  };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret) as any;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret) as any;
}
