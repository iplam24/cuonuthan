export async function up(connection) {
  const [cols] = await connection.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name IN ('scheduled_delivery_time', 'scheduled_delivery_at')`
  );

  const hasCanonical = cols.some((row) => (row.column_name || row.COLUMN_NAME || '').toLowerCase() === 'scheduled_delivery_time');
  const hasLegacy = cols.some((row) => (row.column_name || row.COLUMN_NAME || '').toLowerCase() === 'scheduled_delivery_at');

  if (hasCanonical) return;

  if (hasLegacy) {
    await connection.query(`ALTER TABLE orders CHANGE COLUMN scheduled_delivery_at scheduled_delivery_time DATETIME NULL`);
  } else {
    await connection.query(`ALTER TABLE orders ADD COLUMN scheduled_delivery_time DATETIME NULL AFTER note`);
  }
}
