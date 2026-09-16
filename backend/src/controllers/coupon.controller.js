import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Validate a coupon for checkout
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code || !code.trim()) {
      return sendError(res, 'Vui lòng nhập mã giảm giá!', [], 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    const [rows] = await db.query(
      `SELECT * FROM coupons 
       WHERE UPPER(code) = ? AND is_active = 1
       LIMIT 1`,
      [cleanCode]
    );

    if (rows.length === 0) {
      return sendError(res, 'Mã giảm giá không tồn tại hoặc đã ngừng áp dụng!', [], 404);
    }

    const coupon = rows[0];
    const now = new Date();

    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return sendError(res, 'Chương trình ưu đãi cho mã này chưa bắt đầu!', [], 400);
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return sendError(res, 'Mã giảm giá đã hết hạn sử dụng!', [], 400);
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return sendError(res, 'Mã giảm giá đã hết lượt sử dụng!', [], 400);
    }

    const minOrder = Number(coupon.min_order_value || 0);
    if (orderSubtotal < minOrder) {
      return sendError(
        res,
        `Mã này áp dụng cho đơn hàng tối thiểu từ ${new Intl.NumberFormat('vi-VN').format(minOrder)}đ!`,
        [],
        400
      );
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage' || coupon.discount_type === 'percent') {
      discountAmount = (orderSubtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
        discountAmount = Number(coupon.max_discount);
      }
    } else {
      discountAmount = Math.min(Number(coupon.discount_value), orderSubtotal);
    }

    return sendSuccess(res, {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      discount_amount: discountAmount,
      min_order_value: minOrder,
      max_discount: coupon.max_discount ? Number(coupon.max_discount) : null,
    }, 'Áp dụng mã giảm giá thành công!');
  } catch (err) {
    next(err);
  }
};

// Get list of active coupons for customer view
export const getActiveCoupons = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, code, description, discount_type, discount_value, min_order_value, max_discount, end_date
       FROM coupons
       WHERE is_active = 1 AND (end_date IS NULL OR end_date > NOW())
       ORDER BY discount_value DESC`
    );

    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

// Admin: Get all coupons
export const getAllCouponsAdmin = async (req, res, next) => {
  try {
    const [rows] = await db.query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    return sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
};

// Admin: Create coupon
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discount_type = 'fixed_amount',
      discount_value,
      min_order_value = 0,
      max_discount = null,
      usage_limit = 100,
      end_date = null,
    } = req.body;

    if (!code || !discount_value) {
      return sendError(res, 'Vui lòng điền mã coupon và giá trị giảm giá!', 400);
    }

    const cleanCode = code.trim().toUpperCase();

    const [chk] = await db.query(`SELECT id FROM coupons WHERE UPPER(code) = ?`, [cleanCode]);
    if (chk.length > 0) {
      return sendError(res, `Mã giảm giá "${cleanCode}" đã tồn tại!`, 409);
    }

    const [result] = await db.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, is_active, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)`,
      [cleanCode, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, end_date]
    );

    return sendSuccess(res, { id: result.insertId, code: cleanCode }, 'Tạo mã giảm giá thành công!', 201);
  } catch (err) {
    next(err);
  }
};

// Admin: Delete/Deactivate coupon
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`SELECT is_active FROM coupons WHERE id = ?`, [id]);
    if (rows.length === 0) return sendError(res, 'Không tìm thấy coupon', 404);

    const newStatus = rows[0].is_active ? 0 : 1;
    await db.query(`UPDATE coupons SET is_active = ? WHERE id = ?`, [newStatus, id]);

    return sendSuccess(res, { is_active: newStatus }, `Đã ${newStatus ? 'kích hoạt' : 'ngừng kích hoạt'} mã giảm giá!`);
  } catch (err) {
    next(err);
  }
};
