import { defineStore } from 'pinia';
import { authService } from '../services/auth.service.js';
import { useAddressStore } from './addressStore.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('uthan_user') || 'null'),
    token: localStorage.getItem('uthan_token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => ['admin', 'manager', 'staff'].includes(state.user?.role),
    userName: (state) => state.user?.fullName || state.user?.username || 'Khách',
  },

  actions: {
    async login(identifier, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(identifier, password);
        const { token, user } = response.data;
        this.token = token;
        this.user = user;
        localStorage.setItem('uthan_token', token);
        localStorage.setItem('uthan_user', JSON.stringify(user));
        return user;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.register(data);
        const { token, user } = response.data;
        this.token = token;
        this.user = user;
        localStorage.setItem('uthan_token', token);
        localStorage.setItem('uthan_user', JSON.stringify(user));
        return user;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('uthan_token');
      localStorage.removeItem('uthan_user');
      useAddressStore().logoutReset();
    },

    initAuth() {
      const token = localStorage.getItem('uthan_token');
      const user = localStorage.getItem('uthan_user');
      if (token && user) {
        try {
          this.token = token;
          this.user = JSON.parse(user);
        } catch (e) {
          this.logout();
        }
      }
    },
  },
});
