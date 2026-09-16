export const ADDRESS_LIMIT = 20;
const PHONE_PATTERN = /^(?:\+84|0)\d{9}$/;
const FIELDS = ['receiver_name', 'receiver_phone', 'province', 'district', 'ward', 'detail_address', 'is_default'];
const TEXT_LIMITS = { receiver_name: 100, province: 100, district: 100, ward: 100, detail_address: 255 };

export function normalizeWhitespace(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;
}

export function normalizePhone(value) {
  if (typeof value !== 'string') return '';
  const compact = value.trim().replace(/[\s.()-]/g, '');
  return compact.startsWith('84') && !compact.startsWith('+84') ? `+${compact}` : compact;
}

export function validatePhone(value) {
  return PHONE_PATTERN.test(normalizePhone(value));
}

export function normalizeAddressInput(input, { partial = false } = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const data = {};
  for (const field of FIELDS) {
    if (!(field in source)) continue;
    data[field] = field === 'receiver_phone'
      ? normalizePhone(source[field])
      : field === 'is_default' ? source[field] : normalizeWhitespace(source[field]);
  }
  if (!partial && !('province' in data)) data.province = 'Hà Nội';
  return data;
}

export function validateAddress(input, { partial = false } = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const data = normalizeAddressInput(source, { partial });
  const errors = [];
  const unknownKeys = Object.keys(source).filter((key) => !FIELDS.includes(key));
  for (const key of unknownKeys) errors.push({ field: key, message: 'Trường dữ liệu không được hỗ trợ.' });

  for (const field of Object.keys(TEXT_LIMITS)) {
    if (!partial || field in source) {
      if (typeof data[field] !== 'string' || !data[field]) errors.push({ field, message: 'Trường này không được để trống.' });
      else if (data[field].length > TEXT_LIMITS[field]) errors.push({ field, message: `Trường này không được quá ${TEXT_LIMITS[field]} ký tự.` });
    }
  }
  if (!partial || 'receiver_phone' in source) {
    if (!data.receiver_phone) errors.push({ field: 'receiver_phone', message: 'Số điện thoại không được để trống.' });
    else if (!validatePhone(data.receiver_phone)) errors.push({ field: 'receiver_phone', message: 'Số điện thoại không hợp lệ.' });
  }
  if ('is_default' in source && typeof data.is_default !== 'boolean' && data.is_default !== 0 && data.is_default !== 1) {
    errors.push({ field: 'is_default', message: 'is_default phải là boolean.' });
  } else if ('is_default' in data) data.is_default = Boolean(data.is_default);
  if (partial && !Object.keys(data).length && !unknownKeys.length) errors.push({ field: 'body', message: 'Không có dữ liệu để cập nhật.' });
  return { valid: errors.length === 0, errors, data };
}

export function formatAddress(address) {
  return [address.detail_address, address.ward, address.district, address.province].filter(Boolean).join(', ');
}

export function toAddressResponse(row) {
  return {
    id: row.id,
    receiverName: row.receiver_name,
    receiverPhone: row.receiver_phone,
    province: row.province,
    district: row.district,
    ward: row.ward,
    detailAddress: row.detail_address,
    formattedAddress: formatAddress(row),
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
