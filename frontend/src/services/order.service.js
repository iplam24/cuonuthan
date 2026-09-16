import api from './api.js';

export const orderService = {
  createOrder(orderData) {
    return api.post('/orders', orderData);
  },

  getOrderTracking(orderCode, options = {}) {
    const params = {};
    if (options.phone) params.phone = options.phone;
    if (options.trackingToken) params.tracking_token = options.trackingToken;
    const headers = {};
    const localToken = localStorage.getItem(`tracking_${orderCode}`);
    if (options.trackingToken || localToken) {
      headers['x-tracking-token'] = options.trackingToken || localToken;
    }
    if (options.phone) {
      headers['x-tracking-phone'] = options.phone;
    }
    return api.get(`/orders/tracking/${orderCode}`, { params, headers });
  },

  getMyOrders() {
    return api.get('/orders/my-orders');
  },
};
