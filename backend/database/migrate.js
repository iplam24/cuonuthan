import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPool, testConnection } from '../src/config/database.js';
import { runSeeds } from './seeds/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, 'migrations');

function splitSql(sql) {
  return sql.replace(/^\uFEFF/, '').split(';').map((part) => part.trim())
    .filter((part) => part && !part.split('\n').every((line) => !line.trim() || line.trim().startsWith('--')));
}

async function runMigration() {
  if (process.env.RUN_REMOTE_MIGRATIONS !== 'true') {
    console.error('[Migration] Refusing to connect. Set RUN_REMOTE_MIGRATIONS=true explicitly to run migrations.');
    process.exitCode = 1;
    return;
  }
  const connection = await dbPool.getConnection();
  try {
    await testConnection();
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(191) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const [applied] = await connection.query('SELECT version FROM schema_migrations');
    const appliedSet = new Set(applied.map((row) => row.version));
    if (!appliedSet.has('000')) {
      await connection.beginTransaction();
      try {
        for (const statement of splitSql(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))) await connection.query(statement);
        await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', ['000']);
        await connection.commit();
        console.log('[Migration] Applied bootstrap schema');
      } catch (error) { await connection.rollback(); throw error; }
    }
    const files = fs.readdirSync(migrationsDir).filter((file) => /^\d+.*\.(sql|js)$/.test(file)).sort();
    for (const file of files) {
      const version = file.split('.')[0];
      if (appliedSet.has(version)) continue;
      await connection.beginTransaction();
      try {
        const filePath = path.join(migrationsDir, file);
        if (file.endsWith('.sql')) {
          for (const statement of splitSql(fs.readFileSync(filePath, 'utf8'))) await connection.query(statement);
        } else {
          const migration = await import(`./migrations/${file}`);
          await migration.up(connection);
        }
        await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', [version]);
        await connection.commit();
        console.log(`[Migration] Applied ${file}`);
      } catch (error) { await connection.rollback(); throw error; }
    }
    if (process.env.SKIP_SEEDS !== 'true') await runSeeds();
  } finally { connection.release(); await dbPool.end(); }
}

runMigration().catch((error) => { console.error('[Migration] Failed:', error); process.exitCode = 1; });
