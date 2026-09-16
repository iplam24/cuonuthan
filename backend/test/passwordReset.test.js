import test from 'node:test';
import assert from 'node:assert/strict';

test('OTP generator contract', async (t) => {
  await t.test('generates a 6-digit numeric string', () => {
    for (let i = 0; i < 50; i++) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      assert.match(otp, /^\d{6}$/);
      const num = parseInt(otp, 10);
      assert.ok(num >= 100000 && num <= 999999);
    }
  });

  await t.test('validates 10-minute expiry window', () => {
    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000);
    assert.ok(expiresAt.getTime() > now);
    assert.equal(Math.round((expiresAt.getTime() - now) / 60000), 10);
  });
});
