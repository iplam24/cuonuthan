export const ORDER_STATUSES = Object.freeze([
  'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
  'DELIVERING', 'COMPLETED', 'CANCELLED',
]);

export const ORDER_TRANSITIONS = Object.freeze({
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['DELIVERING'],
  DELIVERING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
});

export function canTransition(from, to) {
  const source = String(from || '').toUpperCase();
  const target = String(to || '').toUpperCase();
  return ORDER_TRANSITIONS[source]?.includes(target) || false;
}

export function assertOrderTransition(from, to) {
  if (!canTransition(from, to)) {
    const error = new Error(`Invalid order status transition: ${from} -> ${to}`);
    error.code = 'INVALID_ORDER_TRANSITION';
    error.statusCode = 409;
    throw error;
  }
  return String(to).toUpperCase();
}
