import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ORDER_STATUSES, canTransition, assertOrderTransition } from '../src/utils/orderStateMachine.js';

describe('order state machine', () => {
  it('contains canonical statuses including READY_FOR_PICKUP and CANCELLED', () => {
    assert.ok(ORDER_STATUSES.includes('READY_FOR_PICKUP'));
    assert.ok(ORDER_STATUSES.includes('CANCELLED'));
  });

  it('allows the normal fulfillment path', () => {
    assert.equal(canTransition('PENDING', 'CONFIRMED'), true);
    assert.equal(canTransition('CONFIRMED', 'PREPARING'), true);
    assert.equal(canTransition('PREPARING', 'READY_FOR_PICKUP'), true);
    assert.equal(canTransition('READY_FOR_PICKUP', 'DELIVERING'), true);
    assert.equal(canTransition('DELIVERING', 'COMPLETED'), true);
  });

  it('allows cancellation only from PENDING or CONFIRMED', () => {
    assert.equal(canTransition('pending', 'cancelled'), true);
    assert.equal(canTransition('CONFIRMED', 'CANCELLED'), true);
    assert.equal(canTransition('PREPARING', 'CANCELLED'), false);
  });

  it('rejects skipped, reverse, repeated, and terminal transitions', () => {
    assert.equal(canTransition('PENDING', 'PREPARING'), false);
    assert.equal(canTransition('DELIVERING', 'READY_FOR_PICKUP'), false);
    assert.equal(canTransition('CONFIRMED', 'CONFIRMED'), false);
    assert.equal(canTransition('COMPLETED', 'CANCELLED'), false);
    assert.equal(canTransition('CANCELLED', 'PENDING'), false);
  });

  it('assertOrderTransition returns normalized target and throws for invalid transition', () => {
    assert.equal(assertOrderTransition('preparing', 'ready_for_pickup'), 'READY_FOR_PICKUP');
    assert.throws(
      () => assertOrderTransition('COMPLETED', 'PENDING'),
      (error) => error.code === 'INVALID_ORDER_TRANSITION' && error.statusCode === 409,
    );
  });
});
