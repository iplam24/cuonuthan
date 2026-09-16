<template>
  <AuthShell
    title="Lấy lại mật khẩu dễ dàng"
    subtitle="Xác thực nhanh qua mã OTP an toàn để tiếp tục thưởng thức món ngon Út Hân."
    heading="Khôi phục mật khẩu"
    description="Nhập số điện thoại đã đăng ký để nhận mã xác thực OTP."
  >
    <!-- BƯỚC 1: NHẬP SỐ ĐIỆN THOẠI / EMAIL -->
    <form v-if="step === 1" class="space-y-5" novalidate @submit.prevent="handleRequestOtp">
      <FormField
        id="reset-identifier"
        label="Số điện thoại hoặc email"
        :error="errors.identifier"
        hint="Nhập SĐT bạn đã dùng khi tạo tài khoản"
        required
      >
        <template #default="{ describedby, invalid }">
          <input
            id="reset-identifier"
            v-model.trim="identifier"
            type="text"
            autocomplete="username"
            placeholder="Ví dụ: 0988888888"
            :aria-describedby="describedby"
            :aria-invalid="invalid"
            class="auth-input"
            @input="errors.identifier = ''"
          />
        </template>
      </FormField>

      <p v-if="errors.form" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700" role="alert">
        {{ errors.form }}
      </p>

      <AppButton type="submit" :loading="loading" class="w-full">
        Gửi mã xác thực OTP
      </AppButton>
    </form>

    <!-- BƯỚC 2: NHẬP MÃ OTP 6 SỐ -->
    <form v-else-if="step === 2" class="space-y-5" novalidate @submit.prevent="handleVerifyOtp">
      <div class="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-slate-700 leading-relaxed shadow-xs">
        Mã OTP 6 số đã được gửi đến <span class="font-bold text-rose-600 font-mono">{{ targetPhone }}</span>. Vui lòng kiểm tra và nhập vào bên dưới.
        <div v-if="debugOtp" class="mt-2 font-mono text-rose-700 font-bold bg-white/90 p-2 rounded-xl border border-rose-200 shadow-xs">
          ⚡ [Thử nghiệm môi trường Dev] Mã OTP: {{ debugOtp }}
        </div>
      </div>

      <FormField
        id="reset-otp"
        label="Mã xác thực OTP (6 số)"
        :error="errors.otp"
        hint="Mã có hiệu lực trong 10 phút"
        required
      >
        <template #default="{ describedby, invalid }">
          <input
            id="reset-otp"
            v-model.trim="otpCode"
            type="text"
            maxlength="6"
            inputmode="numeric"
            placeholder="Nhập 6 chữ số"
            :aria-describedby="describedby"
            :aria-invalid="invalid"
            class="auth-input tracking-widest text-center text-xl font-bold font-mono"
            @input="errors.otp = ''"
          />
        </template>
      </FormField>

      <div class="flex items-center justify-between text-xs text-slate-500">
        <button
          type="button"
          :disabled="countdown > 0 || loading"
          class="font-bold text-rose-600 hover:underline disabled:text-slate-400 disabled:no-underline"
          @click="handleRequestOtp"
        >
          {{ countdown > 0 ? `Gửi lại mã sau (${countdown}s)` : 'Gửi lại mã OTP' }}
        </button>
        <button type="button" class="text-slate-500 hover:text-slate-800 hover:underline" @click="step = 1">
          Đổi số điện thoại
        </button>
      </div>

      <p v-if="errors.form" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700" role="alert">
        {{ errors.form }}
      </p>

      <AppButton type="submit" :loading="loading" class="w-full">
        Xác nhận mã OTP
      </AppButton>
    </form>

    <!-- BƯỚC 3: ĐẶT MẬT KHẨU MỚI -->
    <form v-else-if="step === 3" class="space-y-5" novalidate @submit.prevent="handleResetPassword">
      <FormField
        id="new-password"
        label="Mật khẩu mới"
        :error="errors.password"
        hint="Tối thiểu 6 ký tự"
        required
      >
        <template #default="{ describedby, invalid }">
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Nhập mật khẩu mới"
            :aria-describedby="describedby"
            :aria-invalid="invalid"
            class="auth-input"
            @input="errors.password = ''"
          />
        </template>
      </FormField>

      <FormField
        id="confirm-password"
        label="Xác nhận mật khẩu mới"
        :error="errors.confirmPassword"
        hint="Nhập lại mật khẩu giống bên trên"
        required
      >
        <template #default="{ describedby, invalid }">
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Nhập lại mật khẩu mới"
            :aria-describedby="describedby"
            :aria-invalid="invalid"
            class="auth-input"
            @input="errors.confirmPassword = ''"
          />
        </template>
      </FormField>

      <p v-if="errors.form" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700" role="alert">
        {{ errors.form }}
      </p>

      <AppButton type="submit" :loading="loading" class="w-full">
        Cập nhật mật khẩu mới
      </AppButton>
    </form>

    <div class="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
      Bạn đã nhớ lại mật khẩu?
      <router-link to="/dang-nhap" class="ml-1 font-bold text-rose-600 hover:underline">
        Đăng nhập ngay
      </router-link>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '../../components/common/AppButton.vue';
import AuthShell from '../../components/common/AuthShell.vue';
import FormField from '../../components/common/FormField.vue';
import api from '../../services/api.js';
import { toast } from '../../utils/toast.js';

const router = useRouter();

const step = ref(1);
const identifier = ref('');
const otpCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const resetToken = ref('');
const targetPhone = ref('');
const debugOtp = ref('');

const loading = ref(false);
const countdown = ref(0);
let timer = null;

const errors = reactive({
  identifier: '',
  otp: '',
  password: '',
  confirmPassword: '',
  form: '',
});

function startCountdown() {
  countdown.value = 60;
  clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
}

onBeforeUnmount(() => {
  clearInterval(timer);
});

async function handleRequestOtp() {
  errors.form = '';
  errors.identifier = '';
  if (!identifier.value.trim()) {
    errors.identifier = 'Vui lòng nhập số điện thoại hoặc email.';
    return;
  }

  loading.value = true;
  try {
    const res = await api.post('/auth/forgot-password', {
      phone_or_email: identifier.value.trim(),
    });

    const data = res.data?.data || res.data || {};
    targetPhone.value = data.phone || identifier.value.trim();
    if (data.debug_otp) {
      debugOtp.value = data.debug_otp;
    }
    step.value = 2;
    startCountdown();
    toast.success('Mã xác thực OTP đã được gửi!');
  } catch (err) {
    errors.form = err.response?.data?.message || err.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại.';
  } finally {
    loading.value = false;
  }
}

async function handleVerifyOtp() {
  errors.form = '';
  errors.otp = '';
  if (!otpCode.value.trim() || otpCode.value.trim().length !== 6) {
    errors.otp = 'Mã OTP bao gồm đúng 6 chữ số.';
    return;
  }

  loading.value = true;
  try {
    const res = await api.post('/auth/verify-otp', {
      phone_or_email: targetPhone.value || identifier.value.trim(),
      otp_code: otpCode.value.trim(),
    });

    const data = res.data?.data || res.data || {};
    resetToken.value = data.reset_token;
    step.value = 3;
    toast.success('Xác thực OTP thành công! Mời đặt mật khẩu mới.');
  } catch (err) {
    errors.form = err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
  } finally {
    loading.value = false;
  }
}

async function handleResetPassword() {
  errors.form = '';
  errors.password = '';
  errors.confirmPassword = '';

  if (!newPassword.value || newPassword.value.length < 6) {
    errors.password = 'Mật khẩu mới phải có tối thiểu 6 ký tự.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    return;
  }

  loading.value = true;
  try {
    await api.post('/auth/reset-password', {
      reset_token: resetToken.value,
      new_password: newPassword.value,
    });

    toast.success('Đặt lại mật khẩu thành công! Mời bạn đăng nhập lại.');
    await router.push('/dang-nhap');
  } catch (err) {
    errors.form = err.response?.data?.message || err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-input {
  @apply min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition;
}
.auth-input[aria-invalid='true'] {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500/10;
}
</style>
