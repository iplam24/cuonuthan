const columns = {
  products: [
    ['is_side_dish', "TINYINT(1) NOT NULL DEFAULT 0 AFTER is_bestseller"]
  ],
  orders: [
    ['scheduled_delivery_time', 'DATETIME NULL AFTER note'],
    ['cancelled_at', 'DATETIME NULL AFTER cancel_reason'],
    ['cancelled_by', 'INT NULL AFTER cancelled_at'],
    ['tracking_url', 'VARCHAR(255) NULL AFTER cancelled_by']
  ],
  payments: [
    ['payment_proof_image', 'VARCHAR(255) NULL AFTER bank_code'],
    ['payment_notes', 'VARCHAR(255) NULL AFTER payment_proof_image'],
    ['paid_at', 'DATETIME NULL AFTER payment_notes']
  ],
  payment_transactions: [
    ['transaction_type', "ENUM('deposit','full','refund') NOT NULL DEFAULT 'full' AFTER payment_id"],
    ['amount', 'DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER transaction_type'],
    ['proof_image', 'VARCHAR(255) NULL AFTER amount'],
    ['notes', 'VARCHAR(255) NULL AFTER proof_image'],
    ['transaction_code', 'VARCHAR(100) NULL AFTER notes']
  ],
  order_status_history: [
    ['actor_user_id', 'INT NULL AFTER new_status'],
    ['actor_role', 'VARCHAR(50) NULL AFTER actor_user_id']
  ]
};

export async function up(connection) {
  for (const [table, tableColumns] of Object.entries(columns)) {
    for (const [name, definition] of tableColumns) {
      const [rows] = await connection.query(
        `SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, name]
      );
      if (!rows.length) await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${name}\` ${definition}`);
    }
  }
  await connection.query(`UPDATE order_status_history SET actor_user_id = CASE WHEN changed_by REGEXP '^[0-9]+$' THEN CAST(changed_by AS UNSIGNED) ELSE NULL END WHERE actor_user_id IS NULL`);
}
