<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600">
        <span class="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
        <span>Cập nhật tiến độ trực tuyến</span>
      </div>
      <h1 class="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
        Theo Dõi Đơn Hàng
      </h1>
      <p class="text-sm text-slate-500 max-w-lg mx-auto">
        Nhập mã đơn hàng để theo dõi chi tiết từng khâu: tiếp nhận, Bếp cuốn món, và Shipper giao tận tay bạn.
      </p>
    </div>

    <!-- Search Input Box -->
    <div class="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-soft max-w-xl mx-auto">
      <form @submit.prevent="searchOrder" class="flex gap-2">
        <input
          v-model="inputCode"
          type="text"
          placeholder="Nhập mã đơn hàng (VD: UH...)"
          class="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm uppercase font-mono tracking-wider focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
          required
        />
        <button
          type="submit"
          :disabled="loading"
          class="bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-105 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-soft hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Search class="w-4 h-4" />
          <span>Tra cứu</span>
        </button>
      </form>
    </div>

    <!-- Order Tracking Display / Error / Verification -->
    <!-- Phone Verification Required State -->
    <div v-if="requiresPhone" class="rounded-3xl border border-amber-200 bg-amber-50/90 p-6 sm:p-8 text-center shadow-soft max-w-xl mx-auto space-y-4 fade-in">
      <div class="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 mx-auto text-xl font-bold shadow-xs">
        <ShieldCheck class="w-6 h-6" />
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-900">Xác minh số điện thoại người nhận</h3>
        <p class="text-xs text-slate-600 mt-1 max-w-md mx-auto">
          Đơn hàng <span class="font-mono font-bold text-rose-600">{{ inputCode }}</span> được bảo mật thông tin cá nhân. Vui lòng nhập số điện thoại đặt hàng để xem chi tiết tiến độ món ăn:
        </p>
      </div>
      <form @submit.prevent="verifyWithPhone" class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <input
          v-model="inputPhone"
          type="tel"
          placeholder="Nhập SĐT nhận hàng (VD: 0332302662)"
          class="flex-1 px-4 py-3 rounded-xl border border-amber-300 bg-white text-slate-900 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-amber-500/15 transition"
          required
          autofocus
        />
        <button
          type="submit"
          :disabled="loading"
          class="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-soft transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>Xác nhận</span>
        </button>
      </form>
      <div v-if="verifyError" class="text-xs text-rose-600 font-semibold">
        {{ verifyError }}
      </div>
    </div>

    <!-- Error Display -->
    <div v-else-if="error" class="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-xs" role="alert">
      <p class="font-bold text-rose-800">{{ error }}</p>
      <button @click="searchOrder()" class="mt-3 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-soft transition">
        Thử lại
      </button>
    </div>

    <div v-if="order" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-8 fade-in duration-300">
      <!-- Order Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mã đơn hàng</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="font-extrabold text-2xl text-rose-600 font-mono tracking-wide">
              {{ order.order_code }}
            </span>
            <button
              type="button"
              @click="copyOrderCode"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Sao chép mã đơn"
            >
              <Check v-if="copied" class="w-4 h-4 text-emerald-600" />
              <Copy v-else class="w-4 h-4" />
            </button>
          </div>
          <div class="text-xs text-slate-500 mt-0.5">Đặt lúc: {{ formatDate(order.created_at) }}</div>
          <div class="mt-1 flex items-center gap-1.5 text-[11px] font-semibold" :class="connected ? 'text-emerald-700' : 'text-slate-500'">
            <span class="h-1.5 w-1.5 rounded-full" :class="connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
            <span>{{ connected ? 'Đang kết nối nhận cập nhật trực tiếp từ Bếp' : 'Đang đồng bộ dữ liệu...' }}</span>
          </div>
        </div>

        <!-- Current Status Badge -->
        <div class="text-right">
          <div class="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Trạng thái hiện tại</div>
          <StatusBadge :status="order.status" />
        </div>
      </div>

      <!-- Realtime Status Stepper with Icons -->
      <div v-if="order.status !== 'cancelled' && order.status !== 'refunded'" class="py-4 px-2 sm:px-6">
        <div class="relative flex items-center justify-between">
          <!-- Connector line -->
          <div class="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0"></div>
          <div
            class="absolute left-6 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-rose-600 to-emerald-500 rounded-full transition-all duration-700 z-0"
            :style="{ width: `calc(${getProgressWidth(order.status)} - 24px)` }"
          ></div>

          <!-- Step 1: Pending -->
          <div class="relative z-10 flex flex-col items-center">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm"
              :class="isStepActive(order.status, 'pending') ? 'bg-rose-600 text-white ring-4 ring-rose-500/20 shadow-glow' : 'bg-slate-100 text-slate-400'"
            >
              <Clock class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold mt-2 text-center text-slate-800">Chờ nhận</span>
          </div>

          <!-- Step 2: Confirmed -->
          <div class="relative z-10 flex flex-col items-center">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm"
              :class="isStepActive(order.status, 'confirmed') ? 'bg-rose-600 text-white ring-4 ring-rose-500/20 shadow-glow' : 'bg-slate-100 text-slate-400'"
            >
              <ClipboardCheck class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold mt-2 text-center text-slate-800">Xác nhận</span>
          </div>

          <!-- Step 3: Preparing -->
          <div class="relative z-10 flex flex-col items-center">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm"
              :class="isStepActive(order.status, 'preparing') ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-md animate-pulse' : 'bg-slate-100 text-slate-400'"
            >
              <ChefHat class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold mt-2 text-center text-slate-800">Bếp cuốn</span>
          </div>

          <!-- Step 4: Delivering -->
          <div class="relative z-10 flex flex-col items-center">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm"
              :class="isStepActive(order.status, 'delivering') ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20 shadow-md animate-bounce' : 'bg-slate-100 text-slate-400'"
            >
              <Bike class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold mt-2 text-center text-slate-800">Đang giao</span>
          </div>

          <!-- Step 5: Completed -->
          <div class="relative z-10 flex flex-col items-center">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm"
              :class="isStepActive(order.status, 'completed') ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/25 shadow-md' : 'bg-slate-100 text-slate-400'"
            >
              <CheckCircle2 class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold mt-2 text-center text-slate-800">Đã nhận</span>
          </div>
        </div>
      </div>

      <!-- Review Callout if COMPLETED -->
      <div v-if="order.status === 'completed' && !hasReviewed" class="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 text-2xl font-bold flex-shrink-0 shadow-xs">
            ⭐
          </div>
          <div>
            <div class="font-bold text-sm text-slate-900">Bữa ăn hôm nay của bạn thế nào?</div>
            <div class="text-xs text-slate-600 mt-0.5">Chia sẻ cảm nhận về độ tươi của rau rừng và mắm nêm để Bếp phục vụ bạn chu đáo hơn nhé!</div>
          </div>
        </div>
        <button
          type="button"
          @click="showRatingModal = true"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-105 text-white font-bold text-xs shadow-soft transition flex items-center gap-1.5 whitespace-nowrap active:scale-95"
        >
          <span>⭐ Đánh giá món ăn</span>
        </button>
      </div>

      <!-- Shipper Info Card (if delivering) -->
      <div v-if="order.shipper" class="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bike class="w-6 h-6" />
          </div>
          <div>
            <div class="text-[11px] text-blue-700 font-extrabold uppercase tracking-wider">Tài xế giao hàng</div>
            <div class="font-bold text-sm text-slate-900 mt-0.5">{{ order.shipper.name }} • {{ order.shipper.vehicle_plate }}</div>
          </div>
        </div>
        <a
          :href="`tel:${order.shipper.phone}`"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          Gọi tài xế
        </a>
      </div>

      <!-- Order Items Detail Table -->
      <div class="space-y-3">
        <h3 class="font-bold text-base text-slate-900 flex items-center gap-2">
          <Utensils class="w-4 h-4 text-rose-600" />
          <span>Chi tiết các món ăn</span>
        </h3>
        <div class="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
          >
            <div class="flex items-center gap-3.5">
              <MediaImage
                :src="item.primary_image"
                :alt="item.product_name"
                class="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200/60 shrink-0"
              />
              <div>
                <div class="font-bold text-sm text-slate-900">{{ item.product_name }}</div>
                <div class="text-xs text-slate-500 font-mono mt-0.5">
                  {{ formatVND(item.unit_price) }} × {{ item.quantity }}
                </div>
                <div v-if="item.note" class="text-[11px] text-rose-600 italic mt-0.5">
                  * {{ item.note }}
                </div>
              </div>
            </div>
            <div class="font-bold text-sm text-slate-900 font-mono tabular-nums">
              {{ formatVND(item.total_price) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Breakdown -->
      <div class="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 space-y-2.5 text-sm">
        <div class="flex justify-between text-slate-500">
          <span>Tiền món:</span>
          <span class="font-semibold text-slate-800 font-mono">{{ formatVND(order.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-slate-500">
          <span>Phí giao hàng:</span>
          <span class="font-semibold text-slate-800 font-mono">{{ formatVND(order.shipping_fee) }}</span>
        </div>
        <div v-if="order.discount_amount > 0" class="flex justify-between text-rose-600">
          <span>Khuyến mãi giảm:</span>
          <span class="font-semibold font-mono">-{{ formatVND(order.discount_amount) }}</span>
        </div>
        <div class="pt-2.5 border-t border-slate-200 flex justify-between items-baseline font-bold">
          <span class="text-base text-slate-900">Tổng thanh toán:</span>
          <span class="text-xl font-extrabold text-rose-600 font-mono">{{ formatVND(order.total_amount) }}</span>
        </div>
        <div class="flex justify-between items-center text-xs pt-1">
          <span class="text-slate-500">Trạng thái thanh toán:</span>
          <StatusBadge :status="order.payment_status" />
        </div>
      </div>

      <!-- VietQR Box if Unpaid -->
      <div v-if="order.payment_status === 'unpaid' && order.vietqr" class="p-6 bg-white border-2 border-rose-200 rounded-3xl text-center space-y-3 shadow-soft">
        <h4 class="font-bold text-base text-slate-900">Thanh Toán Trực Tuyến Qua VietQR</h4>
        <p class="text-xs text-slate-500">Mở ứng dụng ngân hàng và quét mã để thanh toán đơn hàng ngay:</p>
        <img :src="order.vietqr.qr_url" alt="VietQR" class="w-56 h-56 mx-auto rounded-2xl shadow-sm border border-slate-200" />
      </div>

      <!-- Contact Actions -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
        <a
          :href="`tel:${settingsStore.hotline}`"
          class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-xs"
        >
          <Phone class="w-4 h-4" />
          <span>Hotline Quán: {{ settingsStore.hotline }}</span>
        </a>

        <a
          v-if="settingsStore.zalo"
          :href="`https://zalo.me/${settingsStore.zalo}?text=${encodeURIComponent('Chào Út Hân, mình muốn hỏi về đơn hàng ' + order.order_code)}`"
          target="_blank"
          class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-xs"
        >
          <span>Chat Hỗ Trợ Zalo</span>
        </a>
      </div>
    </div>

    <!-- Rating Modal -->
    <RatingModal
      v-if="showRatingModal && order"
      :order-code="order.order_code"
      :customer-phone="order.customer_phone"
      :tracking-token="currentTrackingToken"
      @close="showRatingModal = false"
      @submitted="hasReviewed = true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../../stores/orderStore.js';
import { useSettingsStore } from '../../stores/settingsStore.js';
import { socketService } from '../../services/socket.service.js';
import { getFullImageUrl, formatVND } from '../../config/app.config.js';
import { toast } from '../../utils/toast.js';
import api from '../../services/api.js';
import MediaImage from '../../components/common/MediaImage.vue';
import RatingModal from '../../components/food/RatingModal.vue';
import StatusBadge from '../../components/common/StatusBadge.vue';
import {
  Search,
  Utensils,
  Truck,
  Phone,
  Clock,
  ClipboardCheck,
  ChefHat,
  Bike,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-vue-next';

const route = useRoute();
const orderStore = useOrderStore();
const settingsStore = useSettingsStore();

const inputCode = ref(route.params.orderCode || '');
const inputPhone = ref('');
const requiresPhone = ref(false);
const verifyError = ref('');
const order = ref(null);
const loading = ref(false);
const error = ref('');
const connected = ref(socketService.connected);
const showRatingModal = ref(false);
const hasReviewed = ref(false);
const currentTrackingToken = ref('');
const copied = ref(false);

async function copyOrderCode() {
  if (!order.value?.order_code) return;
  try {
    await navigator.clipboard.writeText(order.value.order_code);
    copied.value = true;
    toast.success('Đã sao chép mã đơn hàng!');
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    toast.info(`Mã đơn: ${order.value.order_code}`);
  }
}

async function searchOrder(phoneOverride = '') {
  if (!inputCode.value.trim()) return;
  loading.value = true;
  error.value = '';
  verifyError.value = '';
  const code = inputCode.value.trim().toUpperCase();
  const phone = phoneOverride || inputPhone.value.trim();

  try {
    const data = await orderStore.fetchOrderTracking(code, { phone: phone || undefined });
    order.value = data;
    requiresPhone.value = false;
    verifyError.value = '';

    if (data.tracking_token) {
      localStorage.setItem(`tracking_${data.order_code}`, data.tracking_token);
      currentTrackingToken.value = data.tracking_token;
    } else {
      currentTrackingToken.value = localStorage.getItem(`tracking_${data.order_code}`) || '';
    }

    history.replaceState(null, '', `/tra-cuu/${encodeURIComponent(data.order_code)}`);
    socketService.joinOrder(data.order_code, { phone: data.customer_phone, trackingToken: currentTrackingToken.value || undefined });

    if (data.status === 'completed') {
      try {
        const reviewRes = await api.get(`/reviews/${data.order_code}`);
        if (reviewRes.data?.data?.reviewed) {
          hasReviewed.value = true;
        }
      } catch {}
    }
  } catch (err) {
    order.value = null;
    const msg = err.message || '';
    const status = err.status || err.response?.status;
    const isAuthRequired = status === 403 || msg.includes('xác minh số điện thoại') || msg.includes('mã theo dõi');

    if (isAuthRequired) {
      requiresPhone.value = true;
      if (phone) {
        verifyError.value = 'Số điện thoại không khớp với người nhận đơn hàng này. Vui lòng kiểm tra lại!';
      }
    } else if (status === 404 || msg.includes('Không tìm thấy')) {
      requiresPhone.value = false;
      error.value = 'Không tìm thấy đơn hàng với mã này! Vui lòng kiểm tra lại mã đơn.';
    } else {
      requiresPhone.value = false;
      error.value = msg || 'Có lỗi khi tra cứu đơn hàng, vui lòng thử lại!';
    }
  } finally {
    loading.value = false;
  }
}

async function verifyWithPhone() {
  if (!inputPhone.value.trim()) return;
  await searchOrder(inputPhone.value.trim());
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function normalizedStatus(status) {
  return String(status || '').toLowerCase();
}

function getStatusText(status) {
  status = normalizedStatus(status);
  const map = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Bếp đang nấu',
    ready_for_pickup: 'Sẵn sàng giao',
    delivering: 'Đang giao hàng',
    completed: 'Đã giao thành công',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  };
  return map[status] || status;
}

function getStatusBadgeClass(status) {
  status = normalizedStatus(status);
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'preparing':
      return 'bg-purple-100 text-purple-800';
    case 'ready_for_pickup':
      return 'bg-teal-100 text-teal-800';
    case 'delivering':
      return 'bg-orange-100 text-orange-800';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const statusOrder = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivering', 'completed'];

function isStepActive(currentStatus, stepStatus) {
  const currentIndex = statusOrder.indexOf(normalizedStatus(currentStatus));
  const stepIndex = statusOrder.indexOf(normalizedStatus(stepStatus));
  return currentIndex >= stepIndex;
}

function getProgressWidth(currentStatus) {
  const index = statusOrder.indexOf(normalizedStatus(currentStatus));
  if (index === -1) return '0%';
  return `${(index / (statusOrder.length - 1)) * 100}%`;
}

onMounted(() => {
  if (inputCode.value) {
    searchOrder();
  }

  socketService.on('connect', () => { connected.value = true; });
  socketService.on('disconnect', () => { connected.value = false; });
  // Listen to realtime status update
  socketService.on('order:status_updated', (data) => {
    if (order.value && data.order_code === order.value.order_code) {
      order.value.status = normalizedStatus(data.status);
      toast.info(`Trạng thái đơn hàng cập nhật: ${getStatusText(data.status)}`);
    }
  });

  socketService.on('payment:confirmed', (data) => {
    if (order.value && data.order_code === order.value.order_code) {
      order.value.payment_status = data.payment_status;
      toast.success('Quán đã xác nhận thanh toán thành công!');
    }
  });
});

onUnmounted(() => {
  if (order.value?.order_code) socketService.leaveOrder(order.value.order_code);
  socketService.off('order:status_updated');
  socketService.off('payment:confirmed');
});
</script>
