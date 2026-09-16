export const PHONE_PATTERN = /^(?:\+84|0)\d{9}$/;

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

export function validateAddressInput(form) {
  const errors = {};
  const receiverName = normalizeWhitespace(form.receiver_name || form.receiverName || '');
  const receiverPhone = normalizePhone(form.receiver_phone || form.receiverPhone || '');
  const province = normalizeWhitespace(form.province || 'Hà Nội');
  const district = normalizeWhitespace(form.district || '');
  const ward = normalizeWhitespace(form.ward || '');
  const detailAddress = normalizeWhitespace(form.detail_address || form.detailAddress || '');

  if (!receiverName) {
    errors.receiver_name = 'Vui lòng nhập tên người nhận.';
  } else if (receiverName.length > 100) {
    errors.receiver_name = 'Tên người nhận không được quá 100 ký tự.';
  }

  if (!receiverPhone) {
    errors.receiver_phone = 'Vui lòng nhập số điện thoại.';
  } else if (!validatePhone(receiverPhone)) {
    errors.receiver_phone = 'Số điện thoại không đúng định dạng (10 số).';
  }

  if (!province) {
    errors.province = 'Vui lòng nhập Tỉnh / Thành phố.';
  } else if (province.length > 100) {
    errors.province = 'Tỉnh / Thành phố không quá 100 ký tự.';
  }

  if (!district) {
    errors.district = 'Vui lòng nhập Quận / Huyện.';
  } else if (district.length > 100) {
    errors.district = 'Quận / Huyện không quá 100 ký tự.';
  }

  if (!ward) {
    errors.ward = 'Vui lòng nhập Phường / Xã.';
  } else if (ward.length > 100) {
    errors.ward = 'Phường / Xã không quá 100 ký tự.';
  }

  if (!detailAddress) {
    errors.detail_address = 'Vui lòng nhập địa chỉ cụ thể (số nhà, ngõ/đường).';
  } else if (detailAddress.length > 255) {
    errors.detail_address = 'Địa chỉ chi tiết không được quá 255 ký tự.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      province,
      district,
      ward,
      detail_address: detailAddress,
      is_default: Boolean(form.is_default || form.isDefault),
    },
  };
}

export function formatFullAddress(address) {
  if (!address) return '';
  if (address.formattedAddress) return address.formattedAddress;
  const parts = [
    address.detail_address || address.detailAddress,
    address.ward,
    address.district,
    address.province,
  ].filter(Boolean);
  return parts.join(', ');
}
