import mysql from 'mysql2/promise';
import { env } from './env.js';

export const dbPool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function testConnection() {
  const connection = await dbPool.getConnection();
  try {
    const [rows] = await connection.query('SELECT 1 + 1 AS result, DATABASE() as db');
    return { ok: true, data: rows[0] };
  } finally {
    connection.release();
  }
}

export default dbPool;
