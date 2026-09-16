import pool from '../src/config/database.js';

async function main() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));

    // Check coupon_usages or similar table
    for (const t of ['coupon_usages', 'coupon_history', 'coupons']) {
      try {
        const [cols] = await pool.query(`DESCRIBE ${t}`);
        console.log(`Table ${t} exists:`, cols.map(c => c.Field));
      } catch (e) {
        console.log(`Table ${t} does not exist:`, e.message);
      }
    }

    // Now insert the sample coupons using the REAL column names:
    // id, code, description, discount_type ('percentage','fixed_amount'), discount_value, min_order_value, max_discount, usage_limit, used_count, start_date, end_date, is_active
    const [existing] = await pool.query('SELECT * FROM coupons');
    console.log('Existing coupons:', existing.length);
    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, is_active, start_date, end_date)
        VALUES 
        ('CHAOBANMOI', 'Giảm 20.000đ cho đơn từ 100.000đ', 'fixed_amount', 20000, 100000, 20000, 500, 12, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
        ('FREESHIP', 'Miễn phí ship tối đa 30.000đ cho đơn từ 200.000đ', 'fixed_amount', 30000, 200000, 30000, 1000, 45, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
        ('UTHANVIP10', 'Giảm 10% tối đa 50.000đ cho đơn từ 300.000đ', 'percentage', 10, 300000, 50000, 300, 8, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
        ('CUONNGON30K', 'Giảm 30.000đ tri ân khách hàng cho đơn từ 250.000đ', 'fixed_amount', 30000, 250000, 30000, 200, 5, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY))
      `);
      console.log('Successfully seeded 4 authentic coupons for Út Hân Cuốn!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

main();
