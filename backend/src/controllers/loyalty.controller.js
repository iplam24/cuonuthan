import db from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const RANK_CONFIG = {
  new: { label: 'Thành viên Mới', minSpent: 0, nextRank: 'regular', nextMinSpent: 500000, discountRate: 0 },
  regular: { label: 'Khách Thân Thiết', minSpent: 500000, nextRank: 'loyal', nextMinSpent: 2000000, discountRate: 0.02 },
  loyal: { label: 'Hội Viên Bạc', minSpent: 2000000, nextRank: 'vip', nextMinSpent: 5000000, discountRate: 0.05 },
  vip: { label: 'Hội Viên VIP Vàng', minSpent: 5000000, nextRank: null, nextMinSpent: null, discountRate: 0.10 },
};

export function resolveRank(totalSpent) {
  const spent = Number(totalSpent) || 0;
  if (spent >= 5000000) return 'vip';
  if (spent >= 2000000) return 'loyal';
  if (spent >= 500000) return 'regular';
  return 'new';
}

export const getMyLoyalty = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Vui lòng đăng nhập để xem điểm!', [], 401);

    const [customers] = await db.query(
      `SELECT id, full_name, phone, rank_level, total_orders, total_spent, loyalty_points
       FROM customers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (customers.length === 0) {
      return sendError(res, 'Chưa tìm thấy thông tin khách hàng!', [], 404);
    }

    const cust = customers[0];
    const rankKey = cust.rank_level || 'new';
    const rankMeta = RANK_CONFIG[rankKey] || RANK_CONFIG.new;
    const spent = Number(cust.total_spent) || 0;

    let progressPercent = 100;
    let amountToNextRank = 0;

    if (rankMeta.nextMinSpent) {
      amountToNextRank = Math.max(0, rankMeta.nextMinSpent - spent);
      const span = rankMeta.nextMinSpent - rankMeta.minSpent;
      const achieved = Math.max(0, spent - rankMeta.minSpent);
      progressPercent = Math.min(100, Math.round((achieved / span) * 100));
    }

    // Fetch recent loyalty history
    const [history] = await db.query(
      `SELECT lt.*, o.order_code
       FROM loyalty_transactions lt
       LEFT JOIN orders o ON lt.order_id = o.id
       WHERE lt.customer_id = ?
       ORDER BY lt.created_at DESC
       LIMIT 20`,
      [cust.id]
    );

    return sendSuccess(res, {
      customer_id: cust.id,
      full_name: cust.full_name,
      phone: cust.phone,
      rank: {
        key: rankKey,
        label: rankMeta.label,
        discountRate: rankMeta.discountRate,
        nextRank: rankMeta.nextRank ? RANK_CONFIG[rankMeta.nextRank].label : null,
        nextMinSpent: rankMeta.nextMinSpent,
        amountToNextRank,
        progressPercent
      },
      points: {
        available: cust.loyalty_points || 0,
        vnd_value: (cust.loyalty_points || 0) * 1000,
        rate_earn: '10.000đ = 1 điểm',
        rate_redeem: '1 điểm = 1.000đ',
        max_order_discount_percent: 20
      },
      total_spent: spent,
      total_orders: cust.total_orders || 0,
      history
    });
  } catch (err) {
    next(err);
  }
};
