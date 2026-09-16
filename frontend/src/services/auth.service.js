import api from './api.js';

export const authService = {
  login(identifier, password) {
    return api.post('/auth/login', { identifier, password });
  },

  register(data) {
    return api.post('/auth/register', data);
  },

  getProfile() {
    return api.get('/auth/me');
  },
};
