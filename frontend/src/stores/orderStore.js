import { defineStore } from 'pinia';
import { orderService } from '../services/order.service.js';
import { paymentService } from '../services/payment.service.js';
import { useCartStore } from './cartStore.js';

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null,
    trackingOrder: null,
    myOrders: [],
    loading: false,
    error: null,
  }),

  actions: {
    async createOrder(orderPayload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await orderService.createOrder(orderPayload);
        this.currentOrder = response.data;

        // Clear cart on successful order
        const cartStore = useCartStore();
        cartStore.clearCart();

        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderTracking(orderCode, options = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await orderService.getOrderTracking(orderCode, options);
        this.trackingOrder = response.data;
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async uploadProof(orderCode, proofImage, notes) {
      try {
        const response = await paymentService.uploadProof(orderCode, proofImage, notes);
        if (this.trackingOrder && this.trackingOrder.order_code === orderCode) {
          await this.fetchOrderTracking(orderCode);
        }
        return response.data;
      } catch (err) {
        throw err;
      }
    },

    async fetchMyOrders() {
      this.loading = true;
      try {
        const response = await orderService.getMyOrders();
        this.myOrders = response.data || [];
        return this.myOrders;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
