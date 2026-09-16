async function columnExists(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  return rows.length > 0;
}

export async function up(connection) {
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    // 1. Add loyalty_points to customers
  if (!(await columnExists(connection, 'customers', 'loyalty_points'))) {
    await connection.query(`ALTER TABLE customers ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0 AFTER total_spent`);
  }

  // 2. Add points_used, points_discount to orders
  if (!(await columnExists(connection, 'orders', 'points_used'))) {
    await connection.query(`ALTER TABLE orders ADD COLUMN points_used INT NOT NULL DEFAULT 0 AFTER discount_amount`);
  }
  if (!(await columnExists(connection, 'orders', 'points_discount'))) {
    await connection.query(`ALTER TABLE orders ADD COLUMN points_discount DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER points_used`);
  }

  // 3. Add daily_stock, current_stock, stock_reset_date to products
  if (!(await columnExists(connection, 'products', 'daily_stock'))) {
    await connection.query(`ALTER TABLE products ADD COLUMN daily_stock INT NULL DEFAULT NULL AFTER is_side_dish`);
  }
  if (!(await columnExists(connection, 'products', 'current_stock'))) {
    await connection.query(`ALTER TABLE products ADD COLUMN current_stock INT NULL DEFAULT NULL AFTER daily_stock`);
  }
  if (!(await columnExists(connection, 'products', 'stock_reset_date'))) {
    await connection.query(`ALTER TABLE products ADD COLUMN stock_reset_date DATE NULL AFTER current_stock`);
  }

  // 4. Create reviews table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      customer_id INT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      rating INT NOT NULL DEFAULT 5,
      food_quality_score INT NULL DEFAULT 5,
      sauce_rating INT NULL DEFAULT 5,
      veggie_freshness_score INT NULL DEFAULT 5,
      comment TEXT NULL,
      reply_comment TEXT NULL,
      is_approved TINYINT(1) DEFAULT 1,
      is_featured TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      INDEX idx_reviews_order (order_id),
      INDEX idx_reviews_featured (is_featured),
      INDEX idx_reviews_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 5. Create loyalty_transactions table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      order_id INT NULL,
      points_change INT NOT NULL,
      type ENUM('EARN', 'REDEEM', 'ADJUST', 'REFUND') NOT NULL,
      reason VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
      INDEX idx_loyalty_customer (customer_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 6. Create password_resets table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone_or_email VARCHAR(100) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      token VARCHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_resets_token (token),
      INDEX idx_password_resets_phone (phone_or_email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}
