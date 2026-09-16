<template>
  <header class="sticky top-0 z-40">
    <!-- Sleek Modern Announcement Bar -->
    <div class="bg-slate-950 text-slate-300 px-4 py-1.5 text-xs font-medium border-b border-slate-800/80">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="pulse-dot"></span>
          <span class="text-white font-semibold">{{ settingsStore.storeStatus }}</span>
          <span class="text-slate-600">•</span>
          <span class="hidden sm:inline text-slate-400">Giao nóng tận cửa trong {{ settingsStore.deliveryTime }}</span>
        </div>
        <a
          :href="`tel:${settingsStore.hotline}`"
          class="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium"
        >
          <Phone class="w-3 h-3 text-rose-400" />
          <span>{{ settingsStore.hotline }}</span>
        </a>
      </div>
    </div>

    <!-- Main Glassmorphic Navigation Bar -->
    <div class="glass-header">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <!-- Brand Logo -->
        <router-link to="/" class="flex items-center gap-3 group" aria-label="Út Hân Cuốn, về trang chủ">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 p-0.5 shadow-sm group-hover:shadow-md transition">
            <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="/brand-mark.svg" alt="Út Hân Logo" class="h-8 w-8 object-contain transition duration-300 group-hover:scale-105" />
            </div>
          </div>
          <div>
            <span class="block text-lg sm:text-xl font-extrabold leading-none text-slate-900 tracking-tight group-hover:text-rose-600 transition">
              {{ settingsStore.brandName }}
            </span>
            <span class="mt-0.5 block text-[10px] font-bold uppercase tracking-widest text-rose-600">
              Món Cuốn Việt Nam
            </span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden items-center gap-1 md:flex">
          <router-link
            to="/"
            class="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            active-class="text-rose-600 bg-rose-50 hover:bg-rose-50"
          >
            Thực đơn
          </router-link>
          <router-link
            to="/tra-cuu"
            class="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            active-class="text-rose-600 bg-rose-50 hover:bg-rose-50"
          >
            Tra cứu đơn
          </router-link>
          <a
            href="#about-section"
            class="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Câu chuyện
          </a>
        </nav>

        <!-- Actions (Auth & Cart) -->
        <div class="flex items-center gap-3">
          <!-- Auth -->
          <router-link
            v-if="!authStore.isAuthenticated"
            to="/dang-nhap"
            class="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/70 hover:text-slate-900 transition"
          >
            Đăng nhập
          </router-link>

          <div v-else class="relative">
            <button
              @click="accountOpen = !accountOpen"
              class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 flex items-center gap-2 hover:border-slate-300 shadow-xs transition"
            >
              <User class="w-3.5 h-3.5 text-rose-500" />
              <span>{{ authStore.userName }}</span>
              <span v-if="loyalty" class="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-mono font-bold">
                {{ loyalty.points?.available || 0 }}đ
              </span>
            </button>

            <!-- Shopee Style Account Flyout -->
            <AccountFlyout
              :is-open="accountOpen"
              :loyalty="loyalty"
              @close="accountOpen = false"
            />
          </div>

          <!-- Cart Button -->
          <router-link
            to="/dat-mon"
            class="btn-lacquer-cta relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-soft"
          >
            <ShoppingBag class="h-4 w-4" />
            <span class="hidden sm:inline">Giỏ hàng</span>
            <span
              v-if="cartStore.itemCount"
              class="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-rose-600 shadow-sm"
            >
              {{ cartStore.itemCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl md:hidden" aria-label="Điều hướng di động">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-500"
        active-class="text-rose-600 font-bold"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore.js';
import { useCartStore } from '../../stores/cartStore.js';
import { useSettingsStore } from '../../stores/settingsStore.js';
import api from '../../services/api.js';
import { ShoppingBag, Home, Search, User, Phone } from 'lucide-vue-next';
import AccountFlyout from './AccountFlyout.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const settingsStore = useSettingsStore();
const accountOpen = ref(false);
const loyalty = ref(null);

async function loadLoyalty() {
  if (authStore.isAuthenticated) {
    try {
      const res = await api.get('/me/loyalty');
      loyalty.value = res.data?.data || null;
    } catch {
      loyalty.value = null;
    }
  } else {
    loyalty.value = null;
  }
}

onMounted(loadLoyalty);
watch(() => authStore.isAuthenticated, loadLoyalty);

const navItems = [
  { to: '/', label: 'Thực đơn', icon: Home },
  { to: '/tra-cuu', label: 'Tra cứu', icon: Search },
  { to: '/dat-mon', label: 'Giỏ hàng', icon: ShoppingBag },
  { to: '/don-hang-cua-toi', label: 'Tài khoản', icon: User },
];
</script>
