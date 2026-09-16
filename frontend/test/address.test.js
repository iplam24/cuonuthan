import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { addressService, unwrapAddressResponse } from '../src/services/address.service.js';
import { useAddressStore } from '../src/stores/addressStore.js';
import { normalizePhone, validateAddressInput } from '../src/utils/addressValidation.js';

const originalList = addressService.list;
afterEach(() => { addressService.list = originalList; });

describe('address API mapping', () => {
  it('unwraps backend success response data while accepting direct values', () => {
    const addresses = [{ id: 1, receiverName: 'Lan' }];
    assert.deepEqual(unwrapAddressResponse({ success: true, data: addresses }), addresses);
    assert.deepEqual(unwrapAddressResponse(addresses), addresses);
  });

  it('preselects the default address after fetch', async () => {
    addressService.list = async () => ({ data: [
      { id: 1, isDefault: false },
      { id: 2, isDefault: true },
    ] });
    setActivePinia(createPinia());
    const store = useAddressStore();
    await store.fetchAddresses();
    assert.equal(store.selectedAddressId, 2);
    assert.equal(store.selectedAddress.id, 2);
  });
});

describe('address form validation', () => {
  it('normalizes backend payload fields', () => {
    const result = validateAddressInput({
      receiverName: '  Nguyễn   An ', receiverPhone: '0988 888 888',
      province: ' Hà Nội ', district: 'Ba Đình', ward: 'Điện Biên',
      detailAddress: ' 12 Kim Mã ', isDefault: true,
    });
    assert.equal(result.isValid, true);
    assert.equal(result.data.receiver_name, 'Nguyễn An');
    assert.equal(result.data.receiver_phone, '0988888888');
    assert.equal(result.data.detail_address, '12 Kim Mã');
    assert.equal(result.data.is_default, true);
  });

  it('rejects missing fields and invalid phone numbers', () => {
    const result = validateAddressInput({ receiver_phone: '123' });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.receiver_name);
    assert.ok(result.errors.receiver_phone);
    assert.ok(result.errors.detail_address);
  });

  it('normalizes 84-prefixed phone numbers', () => {
    assert.equal(normalizePhone('84 988 888 888'), '+84988888888');
  });
});
