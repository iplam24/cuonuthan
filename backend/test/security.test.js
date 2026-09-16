import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAllowedOrigins, getAllowedOrigins, isOriginAllowed, safeEqualText } from '../src/utils/security.js';
import { canAccessOrder, normalizePhone } from '../src/utils/orderAccess.js';

const order = { order_code: 'UH-123', customer_phone: '0901 234 567' };

test('origin allowlist parses comma-separated values exactly', () => {
  const origins = parseAllowedOrigins('https://a.test, https://b.test');
  assert.deepEqual(origins, ['https://a.test', 'https://b.test']);
  assert.equal(isOriginAllowed('https://a.test', origins), true);
  assert.equal(isOriginAllowed('https://evil.test', origins), false);
  assert.equal(isOriginAllowed(undefined, origins), true);
});

test('getAllowedOrigins merges dev localhost ports in development', () => {
  const origins = getAllowedOrigins('https://app.example.com', 'development');
  assert.ok(origins.includes('https://app.example.com'));
  assert.ok(origins.includes('http://localhost:5173'));
  assert.ok(origins.includes('http://127.0.0.1:5173'));
  assert.ok(origins.includes('http://localhost:5000'));
  assert.ok(origins.includes('http://127.0.0.1:5000'));
});

test('getAllowedOrigins returns only configured origins in production', () => {
  const origins = getAllowedOrigins('https://prod.example.com', 'production');
  assert.deepEqual(origins, ['https://prod.example.com']);
});

test('isOriginAllowed permits same-origin requests via request origin comparison', () => {
  const origins = getAllowedOrigins('', 'production');
  assert.equal(isOriginAllowed('http://localhost:5000', origins, 'http://localhost:5000'), true);
  assert.equal(isOriginAllowed('http://localhost:5000', origins, 'http://example.com'), false);
});

test('isOriginAllowed accepts missing origin and trims trailing slashes', () => {
  const origins = getAllowedOrigins('https://app.example.com/', 'production');
  assert.equal(isOriginAllowed(undefined, origins), true);
  assert.equal(isOriginAllowed('https://app.example.com', origins), true);
  assert.equal(isOriginAllowed('https://app.example.com/', origins), true);
});

test('safeEqualText compares exact values', () => {
  assert.equal(safeEqualText('abc', 'abc'), true);
  assert.equal(safeEqualText('abc', 'abcd'), false);
});

test('order access permits phone verification and owner JWT claims', () => {
  assert.equal(normalizePhone('+84 901-234-567'), '84901234567');
  assert.equal(canAccessOrder({ phone: '0901234567', order }), true);
  assert.equal(canAccessOrder({ phone: '0901234568', order }), false);
  assert.equal(canAccessOrder({ user: { role: 'customer', phone: '0901234567' }, order }), true);
  assert.equal(canAccessOrder({ user: { role: 'staff' }, order }), true);
  assert.equal(canAccessOrder({ user: { role: 'customer', userId: 4 }, order: { ...order, customer_user_id: 4 } }), true);
  assert.equal(canAccessOrder({ user: { role: 'customer', userId: 5 }, order: { ...order, customer_user_id: 4 } }), false);
});
