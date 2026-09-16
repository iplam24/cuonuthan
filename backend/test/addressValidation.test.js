import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhone,
  validatePhone,
  normalizeWhitespace,
  validateAddress,
  formatAddress,
  toAddressResponse
} from '../src/utils/addressValidation.js';

describe('addressValidation - phone normalization & validation', () => {
  it('normalizes 0-prefixed 10-digit vn numbers', () => {
    assert.equal(normalizePhone(' 0912 345 678 '), '0912345678');
    assert.equal(normalizePhone('0912-345-678'), '0912345678');
    assert.equal(normalizePhone('0912.345.678'), '0912345678');
    assert.equal(validatePhone('0912345678'), true);
  });

  it('normalizes 84-prefixed vn numbers', () => {
    assert.equal(normalizePhone('+84912345678'), '+84912345678');
    assert.equal(normalizePhone('84912345678'), '+84912345678');
    assert.equal(validatePhone('+84912345678'), true);
    assert.equal(validatePhone('84912345678'), true);
  });

  it('rejects invalid phone numbers', () => {
    assert.equal(validatePhone('12345'), false);
    assert.equal(validatePhone('012345678901'), false);
    assert.equal(validatePhone('abcd'), false);
  });
});

describe('addressValidation - whitespace and format', () => {
  it('normalizes redundant whitespace', () => {
    assert.equal(normalizeWhitespace('  Số 12   ngõ 34   phố   Trần Thái Tông  '), 'Số 12 ngõ 34 phố Trần Thái Tông');
  });

  it('formats full address correctly', () => {
    const formatted = formatAddress({
      detail_address: 'Số 10 Nguyễn Huệ',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      province: 'TP. Hồ Chí Minh'
    });
    assert.equal(formatted, 'Số 10 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');
  });

  it('transforms database row to API response shape', () => {
    const row = {
      id: 5,
      receiver_name: 'Nguyễn Văn A',
      receiver_phone: '0901234567',
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Dịch Vọng',
      detail_address: 'Số 12 ngõ 34 phố Trần Thái Tông',
      is_default: 1,
      created_at: '2026-09-04T12:00:00.000Z',
      updated_at: '2026-09-04T12:00:00.000Z',
    };
    const res = toAddressResponse(row);
    assert.equal(res.id, 5);
    assert.equal(res.receiverName, 'Nguyễn Văn A');
    assert.equal(res.receiverPhone, '0901234567');
    assert.equal(res.province, 'Hà Nội');
    assert.equal(res.district, 'Cầu Giấy');
    assert.equal(res.ward, 'Dịch Vọng');
    assert.equal(res.detailAddress, 'Số 12 ngõ 34 phố Trần Thái Tông');
    assert.equal(res.formattedAddress, 'Số 12 ngõ 34 phố Trần Thái Tông, Dịch Vọng, Cầu Giấy, Hà Nội');
    assert.equal(res.isDefault, true);
    assert.equal(res.createdAt, row.created_at);
    assert.equal(res.updatedAt, row.updated_at);
  });
});

describe('addressValidation - validateAddress', () => {
  const valid = {
    receiver_name: 'Trần Văn B',
    receiver_phone: '0987654321',
    province: 'Hà Nội',
    district: 'Hoàn Kiếm',
    ward: 'Hàng Trống',
    detail_address: 'Số 1 Tràng Tiền',
    is_default: false,
  };

  it('validates a complete valid address', () => {
    const result = validateAddress(valid);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.data.receiver_name, 'Trần Văn B');
    assert.equal(result.data.receiver_phone, '0987654321');
  });

  it('defaults province to Hà Nội if missing on full creation', () => {
    const { province, ...withoutProvince } = valid;
    const result = validateAddress(withoutProvince);
    assert.equal(result.valid, true);
    assert.equal(result.data.province, 'Hà Nội');
  });

  it('returns errors for missing required fields', () => {
    const result = validateAddress({});
    assert.equal(result.valid, false);
    const fields = result.errors.map(e => e.field);
    assert.ok(fields.includes('receiver_name'));
    assert.ok(fields.includes('receiver_phone'));
    assert.ok(fields.includes('district'));
    assert.ok(fields.includes('ward'));
    assert.ok(fields.includes('detail_address'));
  });

  it('rejects unknown fields to avoid unwanted payload pollution', () => {
    const result = validateAddress({ ...valid, hackerField: 'injected' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.field === 'hackerField'));
  });

  it('validates partial address update correctly', () => {
    const partialValid = validateAddress({ receiver_name: 'Nguyễn Văn Mới' }, { partial: true });
    assert.equal(partialValid.valid, true);
    assert.equal(partialValid.data.receiver_name, 'Nguyễn Văn Mới');
    assert.equal(partialValid.data.province, undefined);

    const emptyPartial = validateAddress({}, { partial: true });
    assert.equal(emptyPartial.valid, false);
    assert.ok(emptyPartial.errors.some(e => e.field === 'body'));
  });

  it('validates phone format in partial update', () => {
    const invalidPhone = validateAddress({ receiver_phone: '1234' }, { partial: true });
    assert.equal(invalidPhone.valid, false);
    assert.ok(invalidPhone.errors.some(e => e.field === 'receiver_phone'));
  });
});
