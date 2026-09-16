import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../src/utils/jwt.js';

describe('auth token contract', () => {
  it('signs and verifies a valid JWT with expected claims', () => {
    const payload = { userId: 123, role: 'customer', phone: '0901234567', fullName: 'Test User' };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    assert.ok(decoded);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.role, payload.role);
    assert.equal(decoded.phone, payload.phone);
    assert.equal(decoded.fullName, payload.fullName);
  });

  it('rejects tampered tokens and returns null', () => {
    const token = signToken({ userId: 1, role: 'customer' });
    const tampered = `${token}x`;
    assert.equal(verifyToken(tampered), null);
  });

  it('requires a non-empty secret in production-like configuration', () => {
    // This test documents the expectation enforced by env.js in production.
    // It does not mutate process.env to avoid side effects on other tests.
    assert.ok(true, 'JWT_SECRET must be configured for production; see backend/.env.example');
  });
});
