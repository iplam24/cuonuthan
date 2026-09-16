import { dbPool } from '../src/config/database.js';

async function seedData() {
  console.log('--- ĐANG NÂNG CẤP BẢNG SẢN PHẨM & SEED MÓN PHỤ, DOANH THU 7 NGÀY ---');
  const conn = await dbPool.getConnection();
  try {
    // 1. Thêm cột is_side_dish nếu chưa có
    try {
      await conn.query(`ALTER TABLE products ADD COLUMN is_side_dish TINYINT(1) DEFAULT 0`);
      console.log('✓ Đã thêm cột is_side_dish vào bảng products');
    } catch (e) {
      console.log('✓ Cột is_side_dish đã tồn tại');
    }

    // 2. Tạo danh mục Món Phụ & Rau Thêm nếu chưa có
    const [existingCat] = await conn.query(`SELECT id FROM categories WHERE slug = 'mon-phu-topping'`);
    let sideCatId;
    if (existingCat.length === 0) {
      const [catRes] = await conn.query(`
        INSERT INTO categories (name, slug, description, sort_order, is_active)
        VALUES ('Món Phụ & Rau Thêm', 'mon-phu-topping', 'Rau rừng, bánh tráng, nước chấm và đồ ăn kèm thêm', 8, 1)
      `);
      sideCatId = catRes.insertId;
      console.log('✓ Đã tạo danh mục Món Phụ & Rau Thêm (ID:', sideCatId, ')');
    } else {
      sideCatId = existingCat[0].id;
    }

    // 3. Đánh dấu các món đồ uống là món phụ (is_side_dish = 1)
    await conn.query(`UPDATE products SET is_side_dish = 1 WHERE category_id = 7 OR category_id = ?`, [sideCatId]);

    // 4. Thêm các món phụ đặc trưng nếu chưa có
    const sideDishes = [
      {
        name: 'Rau Rừng Tây Ninh Thêm (Đĩa Lớn)',
        slug: 'rau-rung-tay-ninh-them',
        category_id: sideCatId,
        price: 25000,
        unit: 'đĩa',
        description: 'Đĩa rau rừng tổng hợp: lá cóc non, quế vị, sao nhái, đọt xoài, lá bứa rửa sạch tiệt trùng.',
        is_side_dish: 1
      },
      {
        name: 'Bánh Tráng Phơi Sương Trảng Bàng (Xấp)',
        slug: 'banh-trang-phoi-suong-them',
        category_id: sideCatId,
        price: 15000,
        unit: 'xấp',
        description: 'Bánh tráng phơi sương 2 lớp dẻo dai, ủ lá chuối chuẩn gốc Tây Ninh.',
        is_side_dish: 1
      },
      {
        name: 'Hũ Mắm Nêm Gia Truyền Út Hân (250ml)',
        slug: 'hu-mam-nem-gia-truyen-them',
        category_id: sideCatId,
        price: 20000,
        unit: 'hũ',
        description: 'Mắm nêm cá cơm nguyên chất pha thơm quả dứa băm nhuyễn, ớt tỏi cay thơm nồng.',
        is_side_dish: 1
      },
      {
        name: 'Bún Tươi Sợi Nhỏ Thêm',
        slug: 'bun-tuoi-them',
        category_id: sideCatId,
        price: 10000,
        unit: 'đĩa',
        description: 'Bún tươi sợi nhỏ dẻo thơm, làm mới mỗi sáng.',
        is_side_dish: 1
      },
      {
        name: 'Trà Đào Cam Sả Tươi Mát Lạnh',
        slug: 'tra-dao-cam-sa-tuoi',
        category_id: 7,
        price: 28000,
        unit: 'ly',
        description: 'Trà đào thanh mát với miếng đào giòn ngọt, cam vàng tươi và sả thơm ngát.',
        is_side_dish: 1
      },
      {
        name: 'Trà Tắc Xí Muội Mật Ong Rừng',
        slug: 'tra-tac-xi-muoi-mat-ong',
        category_id: 7,
        price: 25000,
        unit: 'ly',
        description: 'Vị chua ngọt thanh cổ họng, giải ngấy cho món cuốn cực kỳ hợp vị.',
        is_side_dish: 1
      }
    ];

    for (const item of sideDishes) {
      const [ex] = await conn.query(`SELECT id FROM products WHERE slug = ?`, [item.slug]);
      if (ex.length === 0) {
        const [pRes] = await conn.query(`
          INSERT INTO products (category_id, name, slug, price, unit, description, is_available, is_side_dish)
          VALUES (?, ?, ?, ?, ?, ?, 1, 1)
        `, [item.category_id, item.name, item.slug, item.price, item.unit, item.description]);

        await conn.query(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, 1, 1)
        `, [pRes.insertId, '/uploads/products/ThienDuongXanh.jpg']);
        console.log(`✓ Đã thêm món phụ: ${item.name}`);
      }
    }

    // 5. Seed 7 ngày doanh thu thực tế cho orders
    console.log('Đang seed dữ liệu doanh thu 7 ngày...');
    const [orderCount] = await conn.query(`SELECT COUNT(*) as count FROM orders WHERE created_at < NOW() - INTERVAL 1 DAY`);
    if (orderCount[0].count < 10) {
      const sampleNames = ['Hoàng Long', 'Thuỳ Dung', 'Bảo Ngọc', 'Quang Huy', 'Minh Châu', 'Khánh Linh', 'Văn Dũng', 'Hồng Nhung'];
      const samplePhones = ['0912345678', '0987654321', '0903123456', '0938456789', '0966778899'];
      const sampleAddresses = ['15 Lê Lợi, Q.1', '280 Nguyễn Đình Chiểu, Q.3', '45 Trần Não, TP. Thủ Đức', '128 Đường Láng, Đống Đa'];

      // Tạo đơn cho các ngày từ 6 ngày trước đến hôm nay
      for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const ordersForDay = Math.floor(Math.random() * 3) + 2; // 2-4 đơn mỗi ngày
        for (let i = 0; i < ordersForDay; i++) {
          const totalAmt = [265000, 395000, 520000, 780000, 950000, 340000][Math.floor(Math.random() * 6)];
          const subtotal = totalAmt - 25000;
          const code = `UH${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
          const custName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
          const custPhone = samplePhones[Math.floor(Math.random() * samplePhones.length)];
          const custAddr = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

          const [insOrder] = await conn.query(`
            INSERT INTO orders (
              order_code, customer_name, customer_phone, delivery_address,
              subtotal, shipping_fee, total_amount, payment_method, payment_status,
              status, created_at, updated_at
            ) VALUES (
              ?, ?, ?, ?,
              ?, 25000, ?, 'vietqr', 'paid',
              'COMPLETED',
              NOW() - INTERVAL ? DAY + INTERVAL ? HOUR,
              NOW() - INTERVAL ? DAY + INTERVAL ? HOUR
            )
          `, [
            code, custName, custPhone, custAddr,
            subtotal, totalAmt,
            dayOffset, i * 3 + 9,
            dayOffset, i * 3 + 10
          ]);

          // Thêm order items
          await conn.query(`
            INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total_price)
            VALUES (?, 1, 'Mẹt Út Hân Cuốn Cả Thế Giới', 289000, 1, 289000)
          `, [insOrder.insertId]);
        }
      }
      console.log('✓ Đã seed thành công các đơn hàng 7 ngày qua!');
    } else {
      console.log('✓ Đã có đủ dữ liệu đơn hàng phân bổ.');
    }

    console.log('\n🎉 HOÀN TẤT NÂNG CẤP CƠ SỞ DỮ LIỆU & SEED MÓN PHỤ, DOANH THU!');
  } catch (err) {
    console.error('Lỗi seed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seedData();