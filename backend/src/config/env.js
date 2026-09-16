import dotenv from 'dotenv';
dotenv.config();

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name] || String(process.env[name]).trim() === '');
  if (missing.length > 0) {
    throw new Error(`[ENV] Missing required environment variables in production: ${missing.join(', ')}`);
  }
}

if (isProd) {
  requireEnv(['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME']);
}

export const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'uthan_food'
  },
  jwtSecret: process.env.JWT_SECRET || (isProd ? null : 'dev-only-unsafe-jwt-secret'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

if (isProd && !env.jwtSecret) {
  throw new Error('[ENV] JWT_SECRET must be configured in production.');
}
