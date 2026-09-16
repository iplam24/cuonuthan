<template>
  <AuthShell
    title="Thành viên Út Hân, thêm tiện lợi mỗi bữa"
    subtitle="Tạo tài khoản một lần để lưu địa chỉ, theo dõi đơn và không bỏ lỡ ưu đãi dành riêng cho bạn."
    heading="Tạo tài khoản"
    description="Chỉ mất một phút. Bạn sẽ được đăng nhập ngay sau khi đăng ký."
  >
    <form class="space-y-4" novalidate @submit.prevent="handleRegister">
      <FormField id="register-name" label="Họ và tên" :error="errors.fullName" hint="Tên dùng khi nhận món" required>
        <template #default="{ describedby, invalid }">
          <input id="register-name" v-model.trim="form.fullName" type="text" autocomplete="name" placeholder="Nguyễn Văn An" :aria-describedby="describedby" :aria-invalid="invalid" class="auth-input" @blur="validateFullName" @input="errors.fullName = ''" />
        </template>
      </FormField>

      <FormField id="register-phone" label="Số điện thoại" :error="errors.phone" hint="Dùng để đăng nhập và nhận thông tin giao hàng" required>
        <template #default="{ describedby, invalid }">
          <input id="register-phone" v-model.trim="form.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0988 888 888" :aria-describedby="describedby" :aria-invalid="invalid" class="auth-input" @blur="validatePhone" @input="errors.phone = ''" />
        </template>
      </FormField>

      <FormField id="register-email" label="Email (không bắt buộc)" :error="errors.email" hint="Dùng để nhận xác nhận và ưu đãi">
        <template #default="{ describedby, invalid }">
          <input id="register-email" v-model.trim="form.email" type="email" inputmode="email" autocomplete="email" placeholder="ban@email.com" :aria-describedby="describedby" :aria-invalid="invalid" class="auth-input" @blur="validateEmail" @input="errors.email = ''" />
        </template>
      </FormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <FormField id="register-password" label="Mật khẩu" :error="errors.password" hint="Tối thiểu 6 ký tự" required>
          <template #default="{ describedby, invalid }">
            <div class="relative">
              <input id="register-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Tối thiểu 6 ký tự" :aria-describedby="describedby" :aria-invalid="invalid" class="auth-input pr-16" @blur="validatePassword" @input="errors.password = ''" />
              <button type="button" class="password-toggle" :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showPassword = !showPassword">{{ showPassword ? 'Ẩn' : 'Hiện' }}</button>
            </div>
          </template>
        </FormField>

        <FormField id="register-confirm" label="Xác nhận mật khẩu" :error="errors.confirmPassword" hint="Nhập lại mật khẩu" required>
          <template #default="{ describedby, invalid }">
            <div class="relative">
              <input id="register-confirm" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Nhập lại mật khẩu" :aria-describedby="describedby" :aria-invalid="invalid" class="auth-input pr-16" @blur="validateConfirmPassword" @input="errors.confirmPassword = ''" />
              <button type="button" class="password-toggle" :aria-label="showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'" @click="showConfirmPassword = !showConfirmPassword">{{ showConfirmPassword ? 'Ẩn' : 'Hiện' }}</button>
            </div>
          </template>
        </FormField>
      </div>

      <p v-if="errors.form" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700" role="alert">{{ errors.form }}</p>

      <AppButton type="submit" :loading="loading" class="w-full">Tạo tài khoản</AppButton>
    </form>

    <div class="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
      Đã có tài khoản?
      <router-link to="/dang-nhap" class="ml-1 font-bold text-rose-600 hover:underline">Đăng nhập ngay</router-link>
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
const form = reactive({ fullName: '', phone: '', email: '', password: '', confirmPassword: '' });
const errors = reactive({ fullName: '', phone: '', email: '', password: '', confirmPassword: '', form: '' });
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const vnPhonePattern = /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateFullName() {
  errors.fullName = form.fullName.trim() ? '' : 'Vui lòng nhập họ và tên.';
  return !errors.fullName;
}
function validatePhone() {
  errors.phone = vnPhonePattern.test(form.phone.replace(/[\s.-]/g, '')) ? '' : 'Vui lòng nhập số điện thoại Việt Nam hợp lệ.';
  return !errors.phone;
}
function validateEmail() {
  errors.email = !form.email || emailPattern.test(form.email) ? '' : 'Email chưa đúng định dạng.';
  return !errors.email;
}
function validatePassword() {
  errors.password = form.password.length >= 6 ? '' : 'Mật khẩu cần có ít nhất 6 ký tự.';
  return !errors.password;
}
function validateConfirmPassword() {
  if (!form.confirmPassword) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
  else errors.confirmPassword = form.confirmPassword === form.password ? '' : 'Mật khẩu xác nhận chưa khớp.';
  return !errors.confirmPassword;
}
function validateForm() {
  const validations = [validateFullName(), validatePhone(), validateEmail(), validatePassword(), validateConfirmPassword()];
  return validations.every(Boolean);
}

async function handleRegister() {
  errors.form = '';
  if (!validateForm()) return;
  loading.value = true;
  try {
    await authStore.register({
      fullName: form.fullName.trim(),
      phone: form.phone.replace(/[\s.-]/g, ''),
      email: form.email.trim(),
      password: form.password,
    });
    toast.success('Đăng ký thành công!');
    await router.push(String(route.query.redirect || '/'));
  } catch (err) {
    const message = err.message || 'Không thể tạo tài khoản. Vui lòng thử lại.';
    if (/số điện thoại|phone/i.test(message)) errors.phone = message;
    else if (/email/i.test(message)) errors.email = message;
    else errors.form = message;
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
.password-toggle {
  @apply absolute inset-y-0 right-3 text-xs font-bold text-rose-600 hover:text-rose-700;
}
</style>
