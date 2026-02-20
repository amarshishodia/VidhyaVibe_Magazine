import path from 'path';
import dotenv from 'dotenv';

// Load .env from repo root (cwd is services/api when run via pnpm) or current dir
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
