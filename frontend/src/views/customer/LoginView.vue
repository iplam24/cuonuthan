<template>
  <AuthShell
    title="Bữa ngon gần hơn khi bạn là thành viên"
    subtitle="Út Hân lưu những điều cần thiết để mỗi lần đặt món sau nhanh và thuận tiện hơn."
    heading="Chào bạn quay lại"
    description="Đăng nhập để xem đơn hàng và tiếp tục đặt món."
  >
    <form class="space-y-5" novalidate @submit.prevent="handleLogin">
      <FormField id="login-identifier" label="Số điện thoại hoặc email" :error="errors.identifier" hint="Ví dụ: 0988888888 hoặc ban@email.com" required>
        <template #default="{ describedby, invalid }">
          <input
            id="login-identifier"
            v-model.trim="identifier"
            type="text"
            inputmode="email"
            autocomplete="username"
            placeholder="Số điện thoại hoặc email"
            :aria-describedby="describedby"
            :aria-invalid="invalid"
            class="auth-input"
            @blur="validateIdentifier"
            @input="errors.identifier = ''"
          />
        </template>
      </FormField>

      <FormField id="login-password" label="Mật khẩu" :error="errors.password" hint="Nhập mật khẩu tài khoản của bạn" required>
        <template #default="{ describedby, invalid }">
          <div class="relative">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Nhập mật khẩu"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              class="auth-input pr-24"
              @blur="validatePassword"
              @input="errors.password = ''"
            />
            <button type="button" class="absolute inset-y-0 right-3 text-xs font-semibold text-lacquer hover:text-lacquer-dark" :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ẩn' : 'Hiện' }}
            </button>
          </div>
        </template>
      </FormField>

      <div class="flex items-center justify-end">
        <router-link to="/quen-mat-khau" class="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline">
          Quên mật khẩu?
        </router-link>
      </div>

      <p v-if="errors.form" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700" role="alert">{{ errors.form }}</p>

      <AppButton type="submit" :loading="loading" class="w-full">Đăng nhập</AppButton>
    </form>

    <div class="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
      Chưa có tài khoản?
      <router-link to="/dang-ky" class="ml-1 font-bold text-rose-600 hover:underline">Đăng ký thành viên</router-link>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppButton from '../../components/common/AppButton.vue';
import AuthShell from '../../components/common/AuthShell.vue';
import FormField from '../../components/common/FormField.vue';
import { useAuthStore } from '../../stores/authStore.js';
import { toast } from '../../utils/toast.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const identifier = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const errors = reactive({ identifier: '', password: '', form: '' });
const vnPhonePattern = /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateIdentifier() {
  const value = identifier.value.trim().replace(/[\s.-]/g, '');
  if (!value) errors.identifier = 'Vui lòng nhập số điện thoại hoặc email.';
  else if (!vnPhonePattern.test(value) && !emailPattern.test(identifier.value.trim())) errors.identifier = 'Số điện thoại hoặc email chưa đúng định dạng.';
  else errors.identifier = '';
  return !errors.identifier;
}

function validatePassword() {
  errors.password = password.value ? '' : 'Vui lòng nhập mật khẩu.';
  return !errors.password;
}

async function handleLogin() {
  errors.form = '';
  if (!validateIdentifier() || !validatePassword()) return;
  loading.value = true;
  try {
    await authStore.login(identifier.value.trim(), password.value);
    toast.success('Đăng nhập thành công!');
    await router.push(String(route.query.redirect || '/'));
  } catch (err) {
    errors.password = err.message || 'Thông tin đăng nhập chưa chính xác.';
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
