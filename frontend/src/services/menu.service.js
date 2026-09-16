import api from './api.js';

export const menuService = {
  getCategories() {
    return api.get('/categories');
  },

  getProducts(params = {}, config = {}) {
    return api.get('/products', { ...config, params });
  },

  getProductDetail(idOrSlug) {
    return api.get(`/products/${idOrSlug}`);
  },
};
