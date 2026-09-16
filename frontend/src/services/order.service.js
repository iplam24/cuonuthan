import api from './api.js';

export const orderService = {
  createOrder(orderData) {
    return api.post('/orders', orderData);
  },

  getOrderTracking(orderCode) {
    return api.get(`/orders/tracking/${orderCode}`);
  },

  getMyOrders() {
    return api.get('/orders/my-orders');
  },
};
