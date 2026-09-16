import { signToken, verifyToken } from './jwt.js';
import { safeEqualText } from './security.js';

export function createTrackingToken(orderCode, phone) {
  return signToken({ type: 'order_tracking', orderCode, phone: String(phone) }, '30d');
}

export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

export function canAccessOrder({ user, trackingToken, phone, order }) {
  if (!order) return false;
  if (user && ['admin', 'staff'].includes(user.role)) return true;
  if (user && user.phone && normalizePhone(user.phone) === normalizePhone(order.customer_phone)) return true;

  const claim = trackingToken ? verifyToken(trackingToken) : null;
  if (claim?.type === 'order_tracking'
    && safeEqualText(claim.orderCode, order.order_code)
    && normalizePhone(claim.phone) === normalizePhone(order.customer_phone)) return true;

  const supplied = normalizePhone(phone);
  const expected = normalizePhone(order.customer_phone);
  return supplied.length >= 8 && safeEqualText(supplied, expected);
}
