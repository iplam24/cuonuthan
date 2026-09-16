import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { canAccessOrder } from '../utils/orderAccess.js';
import { normalizePhone } from '../utils/addressValidation.js';

// Khách hàng gửi đánh giá cho đơn hàng đã hoàn thành (COMPLETED)
export const createOrderReview = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const {
      rating = 5,
      food_quality_score = 5,
      sauce_rating = 5,
      veggie_freshness_score = 5,
      comment = '',
      phone = '',
      trackingToken = '',
    } = req.body;

    if (!orderCode) {
      return sendError(res, 'Mã đơn hàng không hợp lệ!', [], 400);
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const numFood = Math.min(5, Math.max(1, parseInt(food_quality_score, 10) || 5));
    const numSauce = Math.min(5, Math.max(1, parseInt(sauce_rating, 10) || 5));
    const numVeggie = Math.min(5, Math.max(1, parseInt(veggie_freshness_score, 10) || 5));

    const [orders] = await db.query(
      `SELECT * FROM orders WHERE order_code = ? LIMIT 1`,
      [orderCode.trim()]
    );

    if (orders.length === 0) {
      return sendError(res, 'Không tìm thấy đơn hàng!', [], 404);
    }

    const order = orders[0];

    // Chỉ cho phép đánh giá đơn đã hoàn thành
    if (String(order.status).toUpperCase() !== 'COMPLETED') {
      return sendError(res, 'Chỉ có thể đánh giá món ăn sau khi đơn hàng đã giao thành công!', [], 400);
    }

    // Kiểm tra quyền truy cập đơn hàng
    const allowed = canAccessOrder({
      user: req.user,
      trackingToken: trackingToken || req.headers['x-tracking-token'],
      phone: phone ? normalizePhone(phone) : null,
      order
    });

    if (!allowed) {
      return sendError(res, 'Bạn không có quyền đánh giá đơn hàng này!', [], 403);
    }

    // Kiểm tra đơn hàng đã được đánh giá trước đó chưa
    const [existing] = await db.query(
      `SELECT id FROM reviews WHERE order_id = ? LIMIT 1`,
      [order.id]
    );

    if (existing.length > 0) {
      return sendError(res, 'Đơn hàng này đã được bạn gửi đánh giá rồi! Cảm ơn bạn.', [], 400);
    }

    // Tự động ghim nổi bật nếu 5 sao và có nhận xét chi tiết
    const isFeatured = (numRating === 5 && comment && comment.trim().length > 15) ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO reviews (
        order_id, customer_id, customer_name, customer_phone,
        rating, food_quality_score, sauce_rating, veggie_freshness_score,
        comment, is_approved, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        order.id,
        order.customer_id || null,
        order.customer_name,
        order.customer_phone,
        numRating,
        numFood,
        numSauce,
        numVeggie,
        comment ? comment.trim() : null,
        isFeatured
      ]
    );

    return sendSuccess(
      res,
      {
        id: result.insertId,
        order_code: order.order_code,
        rating: numRating,
        comment
      },
      'Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn giúp Bếp Út Hân hoàn thiện hơn mỗi ngày.',
      201
    );
  } catch (err) {
    next(err);
  }
};

// Kiểm tra xem đơn hàng đã đánh giá chưa
export const getOrderReview = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const [orders] = await db.query(`SELECT id FROM orders WHERE order_code = ? LIMIT 1`, [orderCode.trim()]);
    if (orders.length === 0) return sendError(res, 'Không tìm thấy đơn hàng!', [], 404);

    const [reviews] = await db.query(
      `SELECT id, rating, food_quality_score, sauce_rating, veggie_freshness_score, comment, reply_comment, created_at
       FROM reviews WHERE order_id = ? LIMIT 1`,
      [orders[0].id]
    );

    if (reviews.length === 0) {
      return sendSuccess(res, { reviewed: false, review: null });
    }

    return sendSuccess(res, { reviewed: true, review: reviews[0] });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách đánh giá nổi bật hiển thị trang chủ + thống kê tổng thể
export const getFeaturedReviews = async (req, res, next) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.id, r.customer_name, r.rating, r.food_quality_score, r.sauce_rating,
             r.veggie_freshness_score, r.comment, r.reply_comment, r.created_at,
             CONCAT(SUBSTRING(r.customer_name, 1, 1), '***') as display_name,
             CONCAT(SUBSTRING(r.customer_phone, 1, 4), '****', SUBSTRING(r.customer_phone, -2)) as display_phone
      FROM reviews r
      WHERE r.is_approved = 1
      ORDER BY r.is_featured DESC, r.rating DESC, r.created_at DESC
      LIMIT 12
    `);

    const [[stats]] = await db.query(`
      SELECT
        COUNT(id) as total_reviews,
        COALESCE(ROUND(AVG(rating), 1), 5.0) as avg_rating,
        COALESCE(ROUND(AVG(sauce_rating), 1), 5.0) as avg_sauce,
        COALESCE(ROUND(AVG(veggie_freshness_score), 1), 5.0) as avg_veggies,
        COALESCE(ROUND(AVG(food_quality_score), 1), 5.0) as avg_food
      FROM reviews
      WHERE is_approved = 1
    `);

    return sendSuccess(res, {
      stats: {
        total_reviews: stats?.total_reviews || 0,
        avg_rating: Number(stats?.avg_rating) || 5.0,
        avg_sauce: Number(stats?.avg_sauce) || 5.0,
        avg_veggies: Number(stats?.avg_veggies) || 5.0,
        avg_food: Number(stats?.avg_food) || 5.0,
      },
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// Admin quản lý đánh giá
export const adminGetReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const [rows] = await db.query(`
      SELECT r.*, o.order_code
      FROM reviews r
      JOIN orders o ON r.order_id = o.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [[countRow]] = await db.query(`SELECT COUNT(*) as total FROM reviews`);

    return sendSuccess(res, {
      items: rows,
      pagination: {
        page,
        limit,
        total: countRow.total,
        totalPages: Math.ceil(countRow.total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_approved, is_featured, reply_comment } = req.body;

    const updates = [];
    const values = [];

    if (is_approved !== undefined) {
      updates.push('is_approved = ?');
      values.push(is_approved ? 1 : 0);
    }
    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(is_featured ? 1 : 0);
    }
    if (reply_comment !== undefined) {
      updates.push('reply_comment = ?');
      values.push(reply_comment ? reply_comment.trim() : null);
    }

    if (updates.length === 0) {
      return sendError(res, 'Không có dữ liệu cần cập nhật!', [], 400);
    }

    values.push(id);
    await db.query(`UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`, values);

    return sendSuccess(res, null, 'Cập nhật đánh giá thành công!');
  } catch (err) {
    next(err);
  }
};
