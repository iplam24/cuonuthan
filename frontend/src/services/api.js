import axios from 'axios';
import { appConfig } from '../config/app.config.js';

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uthan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'Có lỗi xảy ra, vui lòng thử lại';

    if (error.response?.status === 401) {
      localStorage.removeItem('uthan_token');
      localStorage.removeItem('uthan_user');
      const isAdmin = window.location.pathname.startsWith('/admin');
      const loginPath = isAdmin ? '/admin/login' : `/dang-nhap?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      if (!window.location.pathname.includes('login')) window.location.href = loginPath;
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;
