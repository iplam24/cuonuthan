import { defineStore } from 'pinia';
import { addressService, unwrapAddressResponse } from '../services/address.service.js';

export const useAddressStore = defineStore('address', {
  state: () => ({ addresses: [], selectedAddressId: null, loading: false, pending: null, error: null }),
  getters: {
    defaultAddress: (state) => state.addresses.find((item) => item.isDefault) || null,
    selectedAddress: (state) => state.addresses.find((item) => item.id === state.selectedAddressId) || null,
    hasAddresses: (state) => state.addresses.length > 0,
  },
  actions: {
    syncSelection() {
      if (!this.addresses.some((item) => item.id === this.selectedAddressId)) {
        this.selectedAddressId = (this.addresses.find((item) => item.isDefault) || this.addresses[0])?.id ?? null;
      }
    },
    async fetchAddresses() {
      this.loading = true; this.error = null;
      try { this.addresses = unwrapAddressResponse(await addressService.list()) || []; this.syncSelection(); return this.addresses; }
      catch (error) { this.error = error.message; throw error; }
      finally { this.loading = false; }
    },
    async run(action, request) {
      this.pending = action; this.error = null;
      try { return await request(); } catch (error) { this.error = error.message; throw error; } finally { this.pending = null; }
    },
    async createAddress(data) {
      return this.run('create', async () => { const item = unwrapAddressResponse(await addressService.create(data)); await this.fetchAddresses(); this.selectedAddressId = item.id; return item; });
    },
    async updateAddress(id, data) {
      return this.run(`update:${id}`, async () => { const item = unwrapAddressResponse(await addressService.update(id, data)); await this.fetchAddresses(); return item; });
    },
    async setDefaultAddress(id) {
      return this.run(`default:${id}`, async () => { const item = unwrapAddressResponse(await addressService.setDefault(id)); await this.fetchAddresses(); this.selectedAddressId = id; return item; });
    },
    async deleteAddress(id) {
      return this.run(`delete:${id}`, async () => { const result = unwrapAddressResponse(await addressService.remove(id)); await this.fetchAddresses(); return result; });
    },
    selectAddress(id) { this.selectedAddressId = this.addresses.some((item) => item.id === id) ? id : null; },
    reset() { this.addresses = []; this.selectedAddressId = null; this.loading = false; this.pending = null; this.error = null; },
    logoutReset() { this.reset(); },
  },
});
