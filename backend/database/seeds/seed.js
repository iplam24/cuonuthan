import bcrypt from 'bcryptjs';
import { dbPool } from '../../src/config/database.js';

export async function runSeeds() {
  const conn = await dbPool.getConnection();
  try {
    await conn.beginTransaction();
    console.log('[Seed] Đang nạp dữ liệu ban đầu...');

    // 1. ROLES
    const roles = [
      ['admin', 'Quản trị viên toàn quyền hệ thống'],
      ['staff', 'Nhân viên quản lý đơn hàng và món ăn'],
      ['shipper', 'Nhân viên giao hàng'],
      ['customer', 'Khách hàng đặt món']
    ];
    for (const [name, desc] of roles) {
      await conn.query(
        'INSERT IGNORE INTO roles (name, description) VALUES (?, ?)',
        [name, desc]
      );
    }
    console.log('[Seed] ✓ Đã seed Roles');

    // Lấy role admin id
    const [[adminRole]] = await conn.query('SELECT id FROM roles WHERE name = ?', ['admin']);

    // 2. ADMIN USER
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    await conn.query(
      `INSERT INTO users (role_id, phone, email, password_hash, full_name, status)
       VALUES (?, ?, ?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name)`,
      [adminRole.id, 'admin', 'admin@uthan.vn', adminPasswordHash, 'Quản Trị Viên Út Hân']
    );
    console.log('[Seed] ✓ Đã seed Admin mặc định (Username: admin | Mật khẩu: admin123)');

    // 3. SETTINGS
    const settings = [
      ['app_name', 'Út Hân Cuốn', 'general', 'Tên thương hiệu quán'],
      ['slogan', 'Bếp ấm Út Hân, món ngon giao tận nơi', 'general', 'Câu khẩu hiệu của quán'],
      ['logo_url', '/uploads/products/MenuCuonCaTheGioi.jpg', 'media', 'Đường dẫn ảnh Logo thương hiệu'],
      ['favicon_url', '/favicon.ico', 'media', 'Đường dẫn Favicon'],
      ['hotline', '0988.888.888', 'contact', 'Số điện thoại hotline nhận đơn'],
      ['facebook_url', 'https://facebook.com/uthan.cuon', 'contact', 'Link Fanpage / Messenger Facebook'],
      ['zalo_url', 'https://zalo.me/0988888888', 'contact', 'Link Zalo tư vấn & nhận bill cọc'],
      ['email', 'lienhe@uthan.vn', 'contact', 'Email liên hệ'],
      ['address', '123 Đường Ẩm Thực, Quận Cầu Giấy, Hà Nội', 'contact', 'Địa chỉ cửa hàng'],
      ['business_hours', '09:00 - 22:00 hàng ngày', 'contact', 'Khung giờ nhận đơn'],
      ['store_status', 'Bếp Út Hân đang mở cửa', 'general', 'Trạng thái hiển thị trên thanh thông báo'],
      ['delivery_time', '25–35 phút', 'shipping', 'Thời gian giao hàng dự kiến'],
      ['shipping_fee', '25000', 'shipping', 'Phí giao hàng mặc định (VNĐ)'],
      ['free_shipping_threshold', '500000', 'shipping', 'Ngưỡng giá trị đơn được Freeship (VNĐ)'],
      ['deposit_threshold', '200000', 'payment', 'Ngưỡng đơn hàng yêu cầu đặt cọc (VNĐ)'],
      ['bank_id', 'MB', 'payment', 'Mã ngân hàng VietQR'],
      ['bank_name', 'MB Bank (Ngân hàng Quân Đội)', 'payment', 'Tên ngân hàng nhận chuyển khoản'],
      ['bank_account_number', '0988888888', 'payment', 'Số tài khoản nhận tiền'],
      ['bank_account_holder', 'NGUYEN THI HAN', 'payment', 'Tên chủ tài khoản nhận tiền'],
      ['default_deposit_amount', '200000', 'payment', 'Số tiền cọc tối thiểu mặc định (VNĐ)'],
      ['deposit_percent', '30', 'payment', 'Tỷ lệ tiền cọc (%)']
    ];
    for (const [key, val, group, desc] of settings) {
      await conn.query(
        `INSERT INTO settings (setting_key, setting_value, group_name, description)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), group_name = VALUES(group_name), description = VALUES(description)`,
        [key, val, group, desc]
      );
    }
    console.log('[Seed] ✓ Đã seed 17 Cấu hình Settings thương hiệu');

    // 4. CATEGORIES (7 Danh mục theo đúng menu thật)
    const categories = [
      ['Món Cuốn Đặc Trưng', 'cuon-dac-trung', 'Các món cuốn thanh mát, rau rừng tươi non chuẩn vị Út Hân', '/uploads/products/MenuCuonCaTheGioi.jpg', 1],
      ['Bò Tươi Mỗi Ngày', 'bo-tuoi-moi-ngay', 'Bò tơ tươi ngon thượng hạng chọn lọc trong ngày', '/uploads/products/BoTuoiMoiNgay.jpg', 2],
      ['Combo Cuốn Thịnh Soạn', 'combo-thinh-soan', 'Set combo đầy đặn dành cho gia đình, hội nhóm, tiệc tùng', '/uploads/products/ComBoSieuVip.jpg', 3],
      ['Lẩu Ấm Nồng', 'lau-am-nong', 'Nước lẩu hầm xương thanh ngọt, vị chua thanh dậy mùi', '/uploads/products/MenuLau.jpg', 4],
      ['Món Nướng Đậm Vị', 'mon-nuong-dam-vi', 'Thịt ướp gia vị Tây Bắc nướng than hoa thơm lừng', '/uploads/products/MenuNuong.jpg', 5],
      ['Món Ăn Chơi & Đồng Quê', 'mon-an-choi-dong-que', 'Hương vị đồng quê dân dã, món nhậu lai rai hấp dẫn', '/uploads/products/MonAnDongQue.jpg', 6],
      ['Đồ Uống & Tráng Miệng', 'do-uong-trang-mieng', 'Nước giải khát, trà thảo mộc tươi mát', '/uploads/products/DoUong.jpg', 7]
    ];
    for (const [name, slug, desc, img, order] of categories) {
      await conn.query(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image_url = VALUES(image_url), sort_order = VALUES(sort_order)`,
        [name, slug, desc, img, order]
      );
    }
    console.log('[Seed] ✓ Đã seed 7 Danh mục Categories chuẩn menu Út Hân');

    // Lấy mapping category slug -> id
    const [catRows] = await conn.query('SELECT id, slug FROM categories');
    const catMap = Object.fromEntries(catRows.map(c => [c.slug, c.id]));

    // 5. PRODUCTS (Gắn ảnh thực tế có trong thư mục uploads/products)
    const products = [
      // Cuốn
      [catMap['cuon-dac-trung'], 'Mẹt Út Hân Cuốn Cả Thế Giới', 'met-ut-han-cuon-ca-the-gioi', 289000, 269000, 'Đặc sản trứ danh: Bắp bò, tai heo, chả tôm, nem lụi kèm mẹt rau rừng và bánh tráng phơi sương', 'mẹt', 1, 1, 1, '/uploads/products/MenuCuonCaTheGioi.jpg'],
      [catMap['cuon-dac-trung'], 'Bò Tơ Cuốn Bánh Tráng Phơi Sương', 'bo-to-cuon-banh-trang-phoi-suong', 189000, 169000, 'Bắp bò luộc gừng thơm lừng, chấm mắm nêm đậm đà', 'đĩa', 1, 1, 1, '/uploads/products/BoTuoiMoiNgay2.jpg'],
      [catMap['cuon-dac-trung'], 'Heo Rừng Cuốn Rau Rừng', 'heo-rung-cuon-rau-rung', 195000, 175000, 'Thịt heo rừng bì giòn sần sật, cuốn kèm 12 loại lá rừng tươi mát', 'đĩa', 1, 0, 1, '/uploads/products/MenuCuonCaTheGioi2.jpg'],
      
      // Bò tươi
      [catMap['bo-tuoi-moi-ngay'], 'Bò Tơ Tái Chanh Hoa Chuối', 'bo-to-tai-chanh-hoa-chuoi', 165000, null, 'Thịt bò tơ tái lăn chanh tươi, bóp nộm hoa chuối giòn ngọt bùi', 'đĩa', 1, 1, 0, '/uploads/products/BoTuoiMoiNgay.jpg'],
      [catMap['bo-tuoi-moi-ngay'], 'Bò Nướng Lụi Phố Núi', 'bo-nuong-lui-pho-nui', 185000, 165000, 'Bò cuộn sả nướng than hoa chấm sốt mắc khén hạt dổi', 'đĩa', 1, 0, 1, '/uploads/products/BoTuoiMoiNgay3.jpg'],
      
      // Combo
      [catMap['combo-thinh-soan'], 'Combo Siêu VIP Út Hân (4-6 người)', 'combo-sieu-vip-ut-han', 699000, 649000, 'Đầy đủ mẹt cuốn đại, bò nướng lụi, lẩu riêu cua đồng và nước uống cho cả bàn tiệc', 'set', 1, 1, 1, '/uploads/products/ComBoSieuVip.jpg'],
      [catMap['combo-thinh-soan'], 'Combo Gia Đình Sum Vầy (3-4 người)', 'combo-gia-dinh-sum-vay', 489000, 449000, 'Mẹt cuốn bò tơ, sườn nướng mật ong và canh măng chua đậm tình quê', 'set', 1, 1, 0, '/uploads/products/ComBoGiaDinh.jpg'],
      [catMap['combo-thinh-soan'], 'Combo Bữa Trưa Đồng Quê (1-2 người)', 'combo-bua-trua-dong-que', 199000, 179000, 'Suất ăn trưa đầy đặn dinh dưỡng: cuốn bắp bò + nộm hoa chuối + trà tắc', 'set', 1, 0, 1, '/uploads/products/ComboBuaTrua.jpg'],
      
      // Lẩu
      [catMap['lau-am-nong'], 'Lẩu Bò Nhúng Dấm Út Hân', 'lau-bo-nhung-dam-ut-han', 399000, 369000, 'Nước dùng chua thanh đậm đà từ nước dừa tươi và giấm gạo, bắp bò tơ tươi nhúng ăn liền', 'nồi', 1, 1, 1, '/uploads/products/MenuLau.jpg'],
      [catMap['lau-am-nong'], 'Lẩu Riêu Cua Bắp Bò Sườn Sụn', 'lau-rieu-cua-bap-bo-suon-sun', 429000, 399000, 'Gạch cua đồng giã tay 100%, sườn sụn giòn sần sật, bắp bò thái hoa', 'nồi', 1, 1, 1, '/uploads/products/MenuLau2.jpg'],
      
      // Nướng
      [catMap['mon-nuong-dam-vi'], 'Nầm Bò Nướng Sốt Me Cay', 'nam-bo-nuong-sot-me-cay', 175000, 155000, 'Nầm giòn dai sần sật, ướp sốt me cay đậm đà kích thích vị giác', 'đĩa', 1, 0, 1, '/uploads/products/MenuNuong.jpg'],
      
      // Món ăn chơi
      [catMap['mon-an-choi-dong-que'], 'Khoai Lang Kén Tẩm Mật Ong', 'khoai-lang-ken-tam-mat-ong', 55000, null, 'Khoai lang vàng ươm, vỏ giòn ruột mềm dẻo ngọt tự nhiên', 'đĩa', 1, 0, 0, '/uploads/products/MonAnChoi.jpg'],
      [catMap['mon-an-choi-dong-que'], 'Nem Tai Thính Bì Giòn', 'nem-tai-thinh-bi-gion', 95000, null, 'Nem tai trộn thính gạo rang vàng, thơm lừng lá sung bánh tráng', 'đĩa', 1, 0, 0, '/uploads/products/MonAnDongQue.jpg'],
      
      // Đồ uống
      [catMap['do-uong-trang-mieng'], 'Trà Tắc Hạt Chia Út Hân', 'tra-tac-hat-chia-ut-han', 25000, null, 'Trà nhài ủ lạnh pha quất tươi và hạt chia giải nhiệt', 'ly', 1, 0, 1, '/uploads/products/DoUong.jpg'],
      [catMap['do-uong-trang-mieng'], 'Nước Mía Sầu Riêng Tươi', 'nuoc-mia-sau-rieng-tuoi', 35000, null, 'Nước mía ép tươi quyện hương sầu riêng thơm béo ngậy', 'ly', 1, 0, 1, '/uploads/products/DoUong.jpg']
    ];

    for (const [catId, name, slug, price, salePrice, desc, unit, isAvail, isFeat, isBest, img] of products) {
      const [res] = await conn.query(
        `INSERT INTO products (category_id, name, slug, price, sale_price, description, unit, is_available, is_featured, is_bestseller)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), sale_price = VALUES(sale_price), description = VALUES(description), is_available = VALUES(is_available)`,
        [catId, name, slug, price, salePrice, desc, unit, isAvail, isFeat, isBest]
      );
      const prodId = res.insertId || (await conn.query('SELECT id FROM products WHERE slug = ?', [slug]))[0][0].id;

      // Product image
      if (img) {
        await conn.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, 1, 0)
           ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)`,
          [prodId, img]
        );
      }
    }
    console.log('[Seed] ✓ Đã seed 15 Món ăn mẫu kèm hình ảnh thật');

    // 6. SHIPPER MẪU
    await conn.query(
      `INSERT INTO shippers (full_name, phone, vehicle_plate, status, is_active)
       VALUES (?, ?, ?, 'available', 1)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
      ['Nguyễn Văn Giao', '0911222333', '29E2-888.99']
    );
    console.log('[Seed] ✓ Đã seed 1 Shipper mẫu');

    await conn.commit();
    console.log('[Seed] === HOÀN THÀNH TẤT CẢ SEED DATA CHO ÚT HÂN CUỐN ===');
  } catch (error) {
    await conn.rollback();
    console.error('[Seed] Lỗi khi seed dữ liệu:', error);
    throw error;
  } finally {
    conn.release();
  }
}
