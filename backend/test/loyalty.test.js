import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRank, RANK_CONFIG } from '../src/controllers/loyalty.controller.js';

test('loyalty rank resolution', async (t) => {
  await t.test('resolves new member under 500,000 VND', () => {
    assert.equal(resolveRank(0), 'new');
    assert.equal(resolveRank(499999), 'new');
  });

  await t.test('resolves regular member from 500,000 to under 2,000,000 VND', () => {
    assert.equal(resolveRank(500000), 'regular');
    assert.equal(resolveRank(1999999), 'regular');
  });

  await t.test('resolves loyal member from 2,000,000 to under 5,000,000 VND', () => {
    assert.equal(resolveRank(2000000), 'loyal');
    assert.equal(resolveRank(4999999), 'loyal');
  });

  await t.test('resolves VIP member from 5,000,000 VND and above', () => {
    assert.equal(resolveRank(5000000), 'vip');
    assert.equal(resolveRank(20000000), 'vip');
  });

  await t.test('handles invalid/missing total spent gracefully', () => {
    assert.equal(resolveRank(null), 'new');
    assert.equal(resolveRank(undefined), 'new');
    assert.equal(resolveRank('not-a-number'), 'new');
  });
});

test('loyalty points earn and redeem rules', async (t) => {
  await t.test('awards 1 point per 10,000 VND spent', () => {
    const calcPoints = (total) => Math.floor(Number(total || 0) / 10000);
    assert.equal(calcPoints(99000), 9);
    assert.equal(calcPoints(150000), 15);
    assert.equal(calcPoints(500000), 50);
    assert.equal(calcPoints(0), 0);
  });

  await t.test('limits redeem discount to 20% of subtotal', () => {
    const subtotal = 200000;
    const maxDiscountAllowed = Math.floor(subtotal * 0.20); // 40,000 VND = 40 points
    assert.equal(maxDiscountAllowed, 40000);

    const userPoints = 100; // 100,000 VND
    const requestedPoints = 50; // wants to use 50 points
    const pointsUsed = Math.min(userPoints, requestedPoints, Math.floor(maxDiscountAllowed / 1000));
    assert.equal(pointsUsed, 40); // capped at 40 points
  });
});
