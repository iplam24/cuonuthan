import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveProductPrice } from '../src/utils/pricing.js';

describe('resolveProductPrice', () => {
  it('returns current_price equal to price when sale_price is missing', () => {
    const result = resolveProductPrice({ price: 100 });
    assert.equal(result.current_price, 100);
    assert.equal(result.original_price, null);
  });

  it('uses sale_price when valid and lower than price', () => {
    const result = resolveProductPrice({ price: 100, sale_price: 80 });
    assert.equal(result.current_price, 80);
    assert.equal(result.original_price, 100);
  });

  it('ignores sale_price greater than price', () => {
    const result = resolveProductPrice({ price: 50, sale_price: 60 });
    assert.equal(result.current_price, 50);
    assert.equal(result.original_price, null);
  });

  it('handles zero sale_price as invalid', () => {
    const result = resolveProductPrice({ price: 100, sale_price: 0 });
    assert.equal(result.current_price, 100);
    assert.equal(result.original_price, null);
  });
});
