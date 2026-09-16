<template>
  <div>
    <!-- Mobile Backdrop with smooth fade -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
        @click="$emit('close')"
      ></div>
    </transition>

    <!-- Slide-up Bottom Sheet -->
    <transition
      enter-active-class="transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 z-50 w-full max-h-[88vh] rounded-t-[32px] bg-white shadow-2xl flex flex-col border-t border-slate-200/80 overflow-hidden"
        @click.stop
      >
        <!-- Top Profile & Rank Banner (Shopee / Superapp Style) -->
        <div class="relative bg-gradient-to-br from-rose-600 via-rose-500 to-rose-700 px-5 pt-3 pb-5 text-white shrink-0">
          <!-- Grab Handle -->
          <div class="w-12 h-1.5 bg-white/40 rounded-full mx-auto mb-3"></div>

          <!-- Close Button -->
          <button
            type="button"
            class="absolute top-3.5 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition"
            aria-label="Đóng bảng tài khoản"
            @click="$emit('close')"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- User Info Row -->
          <div class="flex items-center gap-3.5 pr-8">
            <div class="w-14 h-14 rounded-2xl bg-white/20 p-0.5 backdrop-blur-md shadow-sm shrink-0">
              <div class="w-13 h-13 rounded-[14px] bg-white flex items-center justify-center text-rose-600 font-extrabold text-xl shadow-inner">
                {{ userInitials }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-extrabold text-lg text-white truncate leading-tight">
                {{ authStore.userName }}
              </h3>
              <p class="text-xs text-rose-100/90 truncate font-mono mt-0.5">
                {{ authStore.user?.phone || authStore.user?.email || 'Khách hàng thân thiết' }}
              </p>
              <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold">
                <span>⭐</span>
                <span>{{ loyalty?.rank?.label || 'Thành viên Bếp Út Hân' }}</span>
              </div>
            </div>
          </div>

          <!-- Shopee Xu / Points Card -->
          <div class="mt-4 bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/25 flex items-center justify-between gap-3 shadow-inner">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                🪙
              </div>
              <div>
                <div class="text-[11px] text-rose-100 font-medium">Kho Điểm Thưởng:</div>
                <div class="font-mono font-extrabold text-base text-white leading-tight">
                  {{ (loyalty?.points?.available || 0).toLocaleString('vi-VN') }}
                  <span class="text-xs font-normal opacity-90">điểm</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs bg-white text-rose-700 font-extrabold px-3 py-1 rounded-xl shadow-xs inline-block">
                = {{ formatVND((loyalty?.points?.available || 0) * 1000) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Scrollable Navigation Menu -->
        <div class="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5">
          <!-- Đơn mua của tôi -->
          <router-link
            to="/don-hang-cua-toi"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-rose-50/60 border border-slate-200/60 active:scale-[0.99] transition-all group"
            @click="$emit('close')"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                <ShoppingBag class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                  Đơn hàng của tôi
                </div>
                <div class="text-[11px] text-slate-500">
                  Xem tiến độ món đang nấu & lịch sử đặt
                </div>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5" />
          </router-link>

          <!-- Tra cứu tiến độ đơn hàng -->
          <router-link
            to="/tra-cuu"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/60 active:scale-[0.99] transition-all group"
            @click="$emit('close')"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Bike class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  Tra cứu tiến độ giao hàng
                </div>
                <div class="text-[11px] text-slate-500">
                  Theo dõi Shipper & bếp trực tiếp
                </div>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
          </router-link>

          <!-- Sổ địa chỉ nhận hàng -->
          <router-link
            to="/tai-khoan/dia-chi"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/60 active:scale-[0.99] transition-all group"
            @click="$emit('close')"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Sổ địa chỉ nhận hàng
                </div>
                <div class="text-[11px] text-slate-500">
                  Lưu sẵn địa chỉ nhà riêng, công ty
                </div>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
          </router-link>

          <!-- Đổi mật khẩu tài khoản -->
          <button
            type="button"
            class="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-200/60 active:scale-[0.99] transition-all group text-left"
            @click="openPasswordModal"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                <KeyRound class="w-5 h-5" />
              </div>
              <div>
                <div class="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                  Đổi mật khẩu tài khoản
                </div>
                <div class="text-[11px] text-slate-500">
                  Bảo mật tài khoản thành viên
                </div>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <!-- Logout Action Button -->
        <div class="p-4 bg-slate-50/90 border-t border-slate-200/80 shrink-0 pb-8">
          <button
            type="button"
            class="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100/90 border border-rose-200 text-rose-600 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-98 transition shadow-2xs"
            @click="promptLogout"
          >
            <LogOut class="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- LOGOUT CONFIRMATION MODAL -->
    <div
      v-if="showLogoutConfirm"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
      @click.self="showLogoutConfirm = false"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
        <div class="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
          <LogOut class="w-7 h-7" />
        </div>
        <div>
          <h3 class="font-extrabold text-lg text-slate-900">Xác nhận đăng xuất?</h3>
          <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>{{ authStore.userName }}</strong> không? Giỏ hàng của bạn vẫn được lưu lại an toàn.
          </p>
        </div>
        <div class="flex items-center gap-2.5 pt-2">
          <AppButton
            variant="outline"
            class="flex-1"
            @click="showLogoutConfirm = false"
          >
            Ở lại
          </AppButton>
          <AppButton
            variant="danger"
            class="flex-1"
            @click="confirmLogout"
          >
            Đăng xuất
          </AppButton>
        </div>
      </div>
    </div>

    <!-- CHANGE PASSWORD MODAL -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
      @click.self="showPasswordModal = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600">
              <KeyRound class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-extrabold text-base text-slate-900">Đổi Mật Khẩu</h3>
              <p class="text-[11px] text-slate-500">Tối thiểu 6 ký tự để bảo vệ tài khoản</p>
            </div>
          </div>
          <button
            type="button"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            @click="showPasswordModal = false"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleChangePassword">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Mật khẩu hiện tại</label>
            <input
              v-model="pwdForm.currentPassword"
              type="password"
              placeholder="Nhập mật khẩu đang dùng"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Mật khẩu mới</label>
            <input
              v-model="pwdForm.newPassword"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</label>
            <input
              v-model="pwdForm.confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
              required
            />
          </div>

          <p v-if="pwdError" class="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
            {{ pwdError }}
          </p>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <AppButton
              variant="outline"
              type="button"
              @click="showPasswordModal = false"
            >
              Hủy
            </AppButton>
            <AppButton
              type="submit"
              :loading="pwdLoading"
            >
              Cập nhật mật khẩu
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../../stores/authStore.js';
import { formatVND } from '../../config/app.config.js';
import { toast } from '../../utils/toast.js';
import api from '../../services/api.js';
import AppButton from './AppButton.vue';
import {
  ShoppingBag,
  Bike,
  MapPin,
  KeyRound,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  loyalty: { type: Object, default: null },
});

const emit = defineEmits(['close']);
const authStore = useAuthStore();

const showLogoutConfirm = ref(false);
const showPasswordModal = ref(false);
const pwdLoading = ref(false);
const pwdError = ref('');
const pwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Prevent body scroll when sheet is open
watch(() => props.isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});

const userInitials = computed(() => {
  const name = authStore.userName || 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

function promptLogout() {
  emit('close');
  showLogoutConfirm.value = true;
}

function confirmLogout() {
  authStore.logout();
  showLogoutConfirm.value = false;
  toast.success('Đã đăng xuất thành công!');
}

function openPasswordModal() {
  emit('close');
  pwdError.value = '';
  pwdForm.currentPassword = '';
  pwdForm.newPassword = '';
  pwdForm.confirmPassword = '';
  showPasswordModal.value = true;
}

async function handleChangePassword() {
  pwdError.value = '';
  if (pwdForm.newPassword.length < 6) {
    pwdError.value = 'Mật khẩu mới cần tối thiểu 6 ký tự.';
    return;
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = 'Mật khẩu xác nhận không khớp.';
    return;
  }

  pwdLoading.value = true;
  try {
    await api.post('/auth/change-password', {
      current_password: pwdForm.currentPassword,
      new_password: pwdForm.newPassword,
    });
    toast.success('Đổi mật khẩu thành công!');
    showPasswordModal.value = false;
  } catch (err) {
    pwdError.value = err.response?.data?.message || err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại!';
  } finally {
    pwdLoading.value = false;
  }
}
</script>
