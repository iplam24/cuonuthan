import api from './api.js';

export const adminService = {
  // Dashboard
  getDashboardStats() {
    return api.get('/admin/dashboard');
  },

  // Orders
  getOrders(params = {}) {
    return api.get('/admin/orders', { params });
  },

  getOrderById(id) {
    return api.get(`/admin/orders/${id}`);
  },

  updateOrderStatus(id, status, note = '') {
    return api.put(`/admin/orders/${id}/status`, { status, note });
  },

  assignShipper(id, shipper_id) {
    return api.put(`/admin/orders/${id}/assign-shipper`, { shipper_id });
  },

  addAdminNote(id, note) {
    return api.post(`/admin/orders/${id}/notes`, { note });
  },

  // Products
  getProducts(params = {}) {
    return api.get('/products', { params });
  },

  createProduct(data) {
    return api.post('/products/admin', data);
  },

  updateProduct(id, data) {
    return api.put(`/products/admin/${id}`, data);
  },

  toggleStock(id, field = 'is_out_of_stock') {
    return api.patch(`/products/admin/${id}/toggle-stock`, { field });
  },

  deleteProduct(id) {
    return api.delete(`/products/admin/${id}`);
  },

  // Customers & Shippers
  getCustomers(params = {}) {
    return api.get('/admin/customers', { params });
  },

  getShippers() {
    return api.get('/admin/shippers');
  },

  createShipper(data) {
    return api.post('/admin/shippers', data);
  },

  updateShipper(id, data) {
    return api.put(`/admin/shippers/${id}`, data);
  },

  toggleShipper(id) {
    return api.patch(`/admin/shippers/${id}/toggle`);
  },

  // Categories
  getCategoriesAdmin() {
    return api.get('/categories/admin/all');
  },

  createCategory(data) {
    return api.post('/categories/admin', data);
  },

  updateCategory(id, data) {
    return api.put(`/categories/admin/${id}`, data);
  },

  deleteCategory(id) {
    return api.delete(`/categories/admin/${id}`);
  },

  // Coupons
  getCouponsAdmin() {
    return api.get('/coupons');
  },

  createCoupon(data) {
    return api.post('/coupons', data);
  },

  toggleCoupon(id) {
    return api.patch(`/coupons/${id}/toggle`);
  },

  // Upload
  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
