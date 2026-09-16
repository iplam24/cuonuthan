import { createRouter, createWebHistory } from 'vue-router';
import CustomerLayout from '../layouts/CustomerLayout.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import { appConfig } from '../config/app.config.js';

// Customer Views
import HomeView from '../views/customer/HomeView.vue';
import ProductDetailView from '../views/customer/ProductDetailView.vue';
import CheckoutView from '../views/customer/CheckoutView.vue';
import TrackingView from '../views/customer/TrackingView.vue';
import MyOrdersView from '../views/customer/MyOrdersView.vue';
import AddressesView from '../views/customer/AddressesView.vue';
import LoginView from '../views/customer/LoginView.vue';
import RegisterView from '../views/customer/RegisterView.vue';
import ForgotPasswordView from '../views/customer/ForgotPasswordView.vue';

const routes = [
  // Customer Routes
  {
    path: '/',
    component: CustomerLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'mon-an/:idOrSlug', name: 'product-detail', component: ProductDetailView },
      { path: 'dat-mon', name: 'checkout', component: CheckoutView },
      { path: 'tra-cuu', name: 'tracking-search', component: TrackingView },
      { path: 'tra-cuu/:orderCode', name: 'tracking-detail', component: TrackingView },
      {
        path: 'don-hang-cua-toi',
        name: 'my-orders',
        component: MyOrdersView,
        meta: { requiresAuth: true },
      },
      {
        path: 'tai-khoan/dia-chi',
        name: 'addresses',
        component: AddressesView,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'dang-nhap', name: 'login', component: LoginView },
      { path: 'dang-ky', name: 'register', component: RegisterView },
      { path: 'quen-mat-khau', name: 'forgot-password', component: ForgotPasswordView },
    ],
  },

  // Redirect admin paths directly to Backend EJS Admin SPA
  {
    path: '/admin/:pathMatch(.*)*',
    beforeEnter() {
      window.location.href = `${appConfig.backendUrl}/admin`;
    },
  },
  {
    path: '/admin',
    beforeEnter() {
      window.location.href = `${appConfig.backendUrl}/admin`;
    },
  },

  // Fallback redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('uthan_token');
  const user = JSON.parse(localStorage.getItem('uthan_user') || 'null');

  if (to.meta.requiresAuth) {
    if (!token || !user) {
      return next('/dang-nhap');
    }
  }

  next();
});

export default router;
