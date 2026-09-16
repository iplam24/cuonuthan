import api from './api.js';

export const paymentService = {
  getVietQrInfo(orderIdentifier) {
    return api.get(`/payments/vietqr/${orderIdentifier}`);
  },

  uploadProof(orderCode, proofImage, notes) {
    return api.post('/payments/upload-proof', {
      order_code: orderCode,
      proof_image: proofImage,
      notes,
    });
  },

  confirmPayment(orderId, data) {
    return api.post(`/payments/admin/${orderId}/confirm`, data);
  },
};
