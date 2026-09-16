import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory or backend directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

// Remote database production defaults for Vercel Serverless
const DEFAULT_REMOTE_DB = {
  host: '103.20.102.184',
  port: 3306,
  user: 'xuanlam',
  password: 'Lam14032004@',
  database: 'uthan_food'
};

const DEFAULT_JWT_SECRET = 'uthan_cuon_jwt_secret_key_2026_super_secure';
const DEFAULT_CLIENT_URL = 'https://cuonuthan.pages.dev,https://cuonuthan.vercel.app,http://localhost:5173';

if (isProd) {
  const missing = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'].filter(
    (name) => !process.env[name] || String(process.env[name]).trim() === ''
  );
  if (missing.length > 0) {
    console.warn(`[ENV NOTICE] Environment variables not set in Vercel (${missing.join(', ')}). Using remote production defaults.`);
  }
}

export const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || DEFAULT_REMOTE_DB.host,
    port: parseInt(process.env.DB_PORT, 10) || DEFAULT_REMOTE_DB.port,
    user: process.env.DB_USER || DEFAULT_REMOTE_DB.user,
    password: process.env.DB_PASS || DEFAULT_REMOTE_DB.password,
    database: process.env.DB_NAME || DEFAULT_REMOTE_DB.database
  },
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || DEFAULT_CLIENT_URL
};
