<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
      <div>
        <div class="inline-flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-rose-600">
          <span class="h-2 w-2 rounded-full bg-rose-500"></span>
          <span>LỊCH SỬ ĐẶT MÓN</span>
        </div>
        <h1 class="font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 tracking-tight">
          Đơn Hàng Của Tôi
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <router-link
          to="/tai-khoan/dia-chi"
          class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-xs"
        >
          Sổ địa chỉ
        </router-link>
        <router-link
          to="/"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-105 active:scale-95 text-xs font-bold text-white transition shadow-soft hover:shadow-glow"
        >
          + Đặt món mới
        </router-link>
      </div>
    </div>

    <!-- Orders List Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-center shadow-xs" role="alert">
      <p class="font-bold text-rose-800">{{ error }}</p>
      <button @click="loadOrders" class="mt-3 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-soft transition">
        Thử lại
      </button>
    </div>

    <!-- Orders List -->
    <div v-else-if="orders.length > 0" class="space-y-4">
      <div
        v-for="ord in orders"
        :key="ord.id"
        class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col sm:flex-row justify-between gap-5"
      >
        <div class="space-y-2.5">
          <div class="flex flex-wrap items-center gap-3">
            <span class="font-mono font-extrabold text-rose-600 text-lg tracking-wide">{{ ord.order_code }}</span>
            <span class="text-xs text-slate-400 font-medium">• {{ formatDate(ord.created_at) }}</span>
          </div>
          <div class="text-xs text-slate-600 font-medium line-clamp-1">
            <span class="text-slate-400">Giao đến:</span> {{ ord.delivery_address }}
          </div>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <StatusBadge :status="ord.status" />
            <StatusBadge :status="ord.payment_status" />
            <span class="text-xs font-semibold text-slate-600 ml-1">
              Tổng tiền: <strong class="text-rose-600 font-mono text-sm font-extrabold">{{ formatVND(ord.total_amount) }}</strong>
            </span>
          </div>
        </div>

        <div class="flex sm:flex-col justify-between sm:justify-center items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
          <router-link
            :to="`/tra-cuu/${ord.order_code}`"
            class="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-105 active:scale-95 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
          >
            Xem tiến độ giao
          </router-link>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/70 shadow-soft space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-3xl mx-auto">
        🌯
      </div>
      <div>
        <h3 class="font-bold text-lg text-slate-900">Bạn chưa có đơn hàng nào tại Út Hân</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Hãy khám phá các món cuốn bánh tráng phơi sương tươi ngon, nước chấm gia truyền trứ danh ngay nhé!
        </p>
      </div>
      <router-link
        to="/"
        class="inline-block px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-105 active:scale-95 text-white text-xs font-bold rounded-xl shadow-soft hover:shadow-glow transition-all"
      >
        Khám phá thực đơn ngay
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useOrderStore } from '../../stores/orderStore.js';
import { formatVND } from '../../config/app.config.js';
import StatusBadge from '../../components/common/StatusBadge.vue';

const orderStore = useOrderStore();
const orders = ref([]);
const loading = ref(false);
const error = ref('');

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('vi-VN');
}

async function loadOrders() {
  loading.value = true;
  error.value = '';
  try {
    const list = await orderStore.fetchMyOrders();
    orders.value = list || [];
  } catch (err) {
    error.value = 'Không thể tải lịch sử đơn hàng.';
  } finally {
    loading.value = false;
  }
}
onMounted(loadOrders);
</script>
