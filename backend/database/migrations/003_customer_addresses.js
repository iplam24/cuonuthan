async function columnExists(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function indexExists(connection, table, index) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [table, index]
  );
  return rows.length > 0;
}

export async function up(connection) {
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    if (!(await columnExists(connection, 'shipping_addresses', 'updated_at'))) {
      await connection.query(`ALTER TABLE shipping_addresses ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`);
    }

  // Keep only the newest default per customer before enforcing uniqueness.
  await connection.query(`UPDATE shipping_addresses duplicate_default
    JOIN shipping_addresses keeper
      ON keeper.customer_id = duplicate_default.customer_id
     AND keeper.is_default = 1
     AND duplicate_default.is_default = 1
     AND (keeper.updated_at > duplicate_default.updated_at
       OR (keeper.updated_at = duplicate_default.updated_at AND keeper.id > duplicate_default.id))
    SET duplicate_default.is_default = 0`);

  if (!(await indexExists(connection, 'shipping_addresses', 'idx_shipping_customer_default'))) {
    await connection.query(`ALTER TABLE shipping_addresses ADD INDEX idx_shipping_customer_default (customer_id, is_default)`);
  }

  // NULL values do not conflict in MySQL unique indexes, so only default rows participate.
  if (!(await columnExists(connection, 'shipping_addresses', 'default_customer_id'))) {
    await connection.query(`ALTER TABLE shipping_addresses ADD COLUMN default_customer_id INT GENERATED ALWAYS AS (CASE WHEN is_default = 1 THEN customer_id ELSE NULL END) VIRTUAL`);
  }
  if (!(await indexExists(connection, 'shipping_addresses', 'uq_shipping_one_default'))) {
    await connection.query(`ALTER TABLE shipping_addresses ADD UNIQUE INDEX uq_shipping_one_default (default_customer_id)`);
  }
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

