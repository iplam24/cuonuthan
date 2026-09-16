const PHONE_PATTERN = /^(?:\+?84|0)\d{9}$/;
const PAYMENT_METHODS = new Set(['cod', 'banking', 'vietqr', 'bank_transfer']);

function addError(errors, field, message) {
  errors.push({ field, message });
}

export function normalizeScheduledTime(value, now = new Date()) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const base = new Date(now);
    const [h, m, s] = trimmed.split(':').map(Number);
    base.setHours(h, m, Number.isFinite(s) ? s : 0, 0);
    return base.toISOString();
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function validateCreateOrder(input, now = new Date()) {
  const body = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const errors = [];
  const name = typeof body.customer_name === 'string' ? body.customer_name.trim() : '';
  const phone = typeof body.customer_phone === 'string' ? body.customer_phone.trim() : '';
  const address = typeof body.delivery_address === 'string' ? body.delivery_address.trim() : '';
  const notes = body.delivery_note;
  const paymentMethod = typeof body.payment_method === 'string' ? body.payment_method.toLowerCase() : 'cod';
  const deliveryType = body.delivery_time_type || 'now';

  if (!name) addError(errors, 'customer_name', 'Vui lòng nhập tên khách hàng.');
  else if (name.length > 100) addError(errors, 'customer_name', 'Tên khách hàng không được quá 100 ký tự.');

  if (!phone) addError(errors, 'customer_phone', 'Vui lòng nhập số điện thoại.');
  else if (!PHONE_PATTERN.test(phone.replace(/[ .-]/g, ''))) addError(errors, 'customer_phone', 'Số điện thoại không hợp lệ.');

  if (!address) addError(errors, 'delivery_address', 'Vui lòng nhập địa chỉ giao hàng.');
  else if (address.length > 1000) addError(errors, 'delivery_address', 'Địa chỉ giao hàng quá dài.');

  if (notes != null && typeof notes !== 'string') addError(errors, 'delivery_note', 'Ghi chú phải là chuỗi.');
  else if (typeof notes === 'string' && notes.length > 1000) addError(errors, 'delivery_note', 'Ghi chú không được quá 1000 ký tự.');

  if (!PAYMENT_METHODS.has(paymentMethod)) addError(errors, 'payment_method', 'Phương thức thanh toán không hợp lệ.');
  if (!['now', 'scheduled'].includes(deliveryType)) addError(errors, 'delivery_time_type', 'Loại thời gian giao hàng không hợp lệ.');

  if (deliveryType === 'scheduled') {
    const normalized = normalizeScheduledTime(body.scheduled_delivery_time, now);
    if (!normalized) addError(errors, 'scheduled_delivery_time', 'Thời gian giao hàng không hợp lệ.');
    else if (new Date(normalized) <= now) addError(errors, 'scheduled_delivery_time', 'Thời gian giao hàng phải ở tương lai.');
  } else if (body.scheduled_delivery_time != null && body.scheduled_delivery_time !== '') {
    const normalized = normalizeScheduledTime(body.scheduled_delivery_time, now);
    if (!normalized) addError(errors, 'scheduled_delivery_time', 'Thời gian giao hàng không hợp lệ.');
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    addError(errors, 'items', 'Giỏ hàng của bạn đang trống.');
  } else {
    body.items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        addError(errors, `items.${index}`, 'Món ăn không hợp lệ.');
        return;
      }
      const productId = Number(item.product_id);
      if (!Number.isInteger(productId) || productId <= 0) addError(errors, `items.${index}.product_id`, 'Mã món ăn không hợp lệ.');
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) addError(errors, `items.${index}.quantity`, 'Số lượng phải là số nguyên từ 1 đến 100.');
      if (item.note != null && (typeof item.note !== 'string' || item.note.length > 255)) addError(errors, `items.${index}.note`, 'Ghi chú món phải là chuỗi không quá 255 ký tự.');
    });
  }

  return { valid: errors.length === 0, errors };
}
