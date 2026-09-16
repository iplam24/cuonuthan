import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCreateOrder, normalizeScheduledTime } from '../src/utils/orderValidation.js';

const valid = {
  customer_name: 'Nguyễn Văn A', customer_phone: '0912345678', delivery_address: '123 Đường ABC',
  payment_method: 'cod', delivery_time_type: 'now', items: [{ product_id: 1, quantity: 2 }],
};

describe('validateCreateOrder', () => {
  it('accepts a valid immediate COD order', () => {
    assert.equal(validateCreateOrder(valid).valid, true);
  });

  it('returns field-level errors for invalid required fields and item quantity', () => {
    const result = validateCreateOrder({ customer_name: '', customer_phone: 'bad', delivery_address: '', items: [{ product_id: 1, quantity: 0 }] });
    assert.equal(result.valid, false);
    assert.deepEqual(result.errors.map(error => error.field), ['customer_name', 'customer_phone', 'delivery_address', 'items.0.quantity']);
  });

  it('requires and validates a future scheduled time', () => {
    const missing = validateCreateOrder({ ...valid, delivery_time_type: 'scheduled', scheduled_delivery_time: null });
    assert.ok(missing.errors.some(error => error.field === 'scheduled_delivery_time'));
    const past = validateCreateOrder({ ...valid, delivery_time_type: 'scheduled', scheduled_delivery_time: '2020-01-01T00:00:00Z' });
    assert.ok(past.errors.some(error => error.field === 'scheduled_delivery_time'));
  });

  it('validates payment methods, notes, and item identifiers', () => {
    const result = validateCreateOrder({ ...valid, payment_method: 'crypto', delivery_note: 4, items: [{ product_id: 0, quantity: 1 }] });
    assert.ok(result.errors.some(error => error.field === 'payment_method'));
    assert.ok(result.errors.some(error => error.field === 'delivery_note'));
    assert.ok(result.errors.some(error => error.field === 'items.0.product_id'));
  });
});

describe('normalizeScheduledTime', () => {
  it('normalizes HH:mm into today ISO datetime', () => {
    const now = new Date('2026-09-04T10:00:00+07:00');
    const iso = normalizeScheduledTime('18:30', now);
    assert.ok(iso);
    const date = new Date(iso);
    assert.equal(date.getHours(), 18);
    assert.equal(date.getMinutes(), 30);
  });

  it('passes through full datetime strings', () => {
    const iso = normalizeScheduledTime('2026-09-04T18:30:00+07:00');
    assert.ok(iso);
    assert.equal(new Date(iso).toISOString(), new Date('2026-09-04T18:30:00+07:00').toISOString());
  });

  it('returns null for empty or invalid values', () => {
    assert.equal(normalizeScheduledTime(null), null);
    assert.equal(normalizeScheduledTime(''), null);
    assert.equal(normalizeScheduledTime('not-a-date'), null);
  });
});
