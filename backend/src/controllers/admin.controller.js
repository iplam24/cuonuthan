import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Get comprehensive dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Today's stats
    const [todayRows] = await db.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(id) AS order_count
      FROM orders
      WHERE DATE(created_at) = CURDATE() AND UPPER(status) IN ('CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING', 'COMPLETED')
    `);

    // 2. Month's stats
    const [monthRows] = await db.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(id) AS order_count
      FROM orders
      WHERE MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
        AND UPPER(status) IN ('CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING', 'COMPLETED')
    `);

    // 3. Status breakdown
    const [statusRows] = await db.query(`
      SELECT status, COUNT(id) AS count
      FROM orders
      GROUP BY status
    `);
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      delivering: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0,
    };
    statusRows.forEach((row) => {
      const key = (row.status || '').toLowerCase();
      if (statusCounts[key] !== undefined) {
        statusCounts[key] = Number(row.count);
      }
    });

    // 4. Payment breakdown
    const [paymentRows] = await db.query(`
      SELECT payment_status, COUNT(id) AS count
      FROM orders
      GROUP BY payment_status
    `);
    const paymentCounts = {
      unpaid: 0,
      deposited: 0,
      paid: 0,
      refunded: 0,
    };
    paymentRows.forEach((row) => {
      const key = (row.payment_status || '').toLowerCase();
      if (key === 'deposit_paid') {
        paymentCounts.deposited = (paymentCounts.deposited || 0) + Number(row.count);
      } else if (paymentCounts[key] !== undefined) {
        paymentCounts[key] = Number(row.count);
      }
    });

    // 5. Top 5 bestselling dishes
    const [topProducts] = await db.query(`
      SELECT
        oi.product_id,
        oi.product_name,
        SUM(oi.quantity) AS total_sold,
        SUM(oi.total_price) AS total_sales,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) AS primary_image
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE UPPER(o.status) != 'CANCELLED'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // 6. Recent 10 orders
    const [recentOrders] = await db.query(`
      SELECT id, order_code, customer_name, customer_phone, total_amount, payment_status, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // 7. Last 7 days revenue trend
    const [trendRows] = await db.query(`
      SELECT
        DATE(created_at) AS order_date,
        COALESCE(SUM(total_amount), 0) AS daily_revenue,
        COUNT(id) AS daily_orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND UPPER(status) IN ('CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERING', 'COMPLETED')
      GROUP BY DATE(created_at)
      ORDER BY order_date ASC
    `);

    return sendSuccess(res, {
      today: {
        revenue: Number(todayRows[0].revenue),
        orders: Number(todayRows[0].order_count),
      },
      month: {
        revenue: Number(monthRows[0].revenue),
        orders: Number(monthRows[0].order_count),
      },
      month_revenue: Number(monthRows[0].revenue),
      status_counts: statusCounts,
      payment_counts: paymentCounts,
      top_products: topProducts,
      recent_orders: recentOrders.map(ord => ({
        ...ord,
        status: (ord.status || '').toLowerCase(),
        payment_status: (ord.payment_status || '').toLowerCase(),
      })),
      revenue_trend: trendRows,
      revenue_7_days: trendRows.map(r => ({
        date: new Date(r.order_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: Number(r.daily_revenue),
        orders: Number(r.daily_orders)
      })),
    });
  } catch (err) {
    next(err);
  }
};

// Customer management
export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let query = `SELECT * FROM customers WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countSql = `SELECT COUNT(*) as total FROM (${query}) as count_tbl`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    query += ` ORDER BY total_orders DESC, total_spent DESC LIMIT ? OFFSET ?`;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;
    params.push(limitNum, offset);

    const [customers] = await db.query(query, params);

    // Normalize full_name to name for frontend compatibility
    customers.forEach((c) => {
      c.name = c.full_name;
    });

    return sendSuccess(res, {
      items: customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Shippers list for management & assignment
export const getShippers = async (req, res, next) => {
  try {
    const { active_only } = req.query;
    let query = `
      SELECT s.*, s.full_name as name,
        (SELECT COUNT(id) FROM orders WHERE shipper_id = s.id AND UPPER(status) = 'DELIVERING') as active_deliveries
      FROM shippers s
    `;
    if (active_only === '1' || active_only === 'true') {
      query += ` WHERE s.is_active = 1 `;
    }
    query += ` ORDER BY s.full_name ASC `;

    const [shippers] = await db.query(query);
    return sendSuccess(res, shippers);
  } catch (err) {
    next(err);
  }
};

// Create new shipper
export const createShipper = async (req, res, next) => {
  try {
    const { full_name, phone, vehicle_plate } = req.body;
    if (!full_name || !phone) {
      return sendError(res, 'Vui lòng cung cấp họ tên và số điện thoại shipper!', 400);
    }

    const [result] = await db.query(
      `INSERT INTO shippers (full_name, phone, vehicle_plate, status, is_active)
       VALUES (?, ?, ?, 'available', 1)`,
      [full_name.trim(), phone.trim(), vehicle_plate ? vehicle_plate.trim() : '']
    );

    return sendSuccess(res, {
      id: result.insertId,
      full_name,
      phone,
      vehicle_plate,
    }, 'Thêm nhân viên giao hàng thành công!', 201);
  } catch (err) {
    next(err);
  }
};

// Update shipper
export const updateShipper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone, vehicle_plate, status, is_active } = req.body;

    await db.query(
      `UPDATE shippers SET
        full_name = COALESCE(?, full_name),
        phone = COALESCE(?, phone),
        vehicle_plate = COALESCE(?, vehicle_plate),
        status = COALESCE(?, status),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [full_name, phone, vehicle_plate, status, is_active, id]
    );

    return sendSuccess(res, { id }, 'Cập nhật thông tin shipper thành công!');
  } catch (err) {
    next(err);
  }
};

// Toggle shipper active
export const toggleShipperStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`SELECT is_active FROM shippers WHERE id = ?`, [id]);
    if (rows.length === 0) return sendError(res, 'Không tìm thấy shipper!', 404);

    const newActive = rows[0].is_active ? 0 : 1;
    await db.query(`UPDATE shippers SET is_active = ? WHERE id = ?`, [newActive, id]);

    return sendSuccess(res, { is_active: newActive }, `Đã ${newActive ? 'kích hoạt' : 'tạm ngưng'} tài xế!`);
  } catch (err) {
    next(err);
  }
};

// Delete shipper
export const deleteShipper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(`DELETE FROM shippers WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return sendError(res, 'Không tìm thấy tài xế để xóa!', 404);
    }
    return sendSuccess(res, null, 'Đã xóa tài xế thành công!');
  } catch (err) {
    next(err);
  }
};
