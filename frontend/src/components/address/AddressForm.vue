<template>
  <form class="space-y-4" novalidate @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField id="address-name" label="Tên người nhận" required :error="errors.receiver_name" v-slot="field">
        <input id="address-name" v-model="form.receiver_name" class="form-input" autocomplete="name" :aria-describedby="field.describedby" :aria-invalid="field.invalid" />
      </FormField>
      <FormField id="address-phone" label="Số điện thoại" required :error="errors.receiver_phone" v-slot="field">
        <input id="address-phone" v-model="form.receiver_phone" class="form-input" type="tel" autocomplete="tel" placeholder="0988 888 888" :aria-describedby="field.describedby" :aria-invalid="field.invalid" />
      </FormField>
      <FormField id="address-province" label="Tỉnh / Thành phố" required :error="errors.province" v-slot="field">
        <input id="address-province" v-model="form.province" class="form-input" autocomplete="address-level1" :aria-describedby="field.describedby" :aria-invalid="field.invalid" />
      </FormField>
      <FormField id="address-district" label="Quận / Huyện" required :error="errors.district" v-slot="field">
        <input id="address-district" v-model="form.district" class="form-input" autocomplete="address-level2" :aria-describedby="field.describedby" :aria-invalid="field.invalid" />
      </FormField>
      <FormField id="address-ward" label="Phường / Xã" required :error="errors.ward" v-slot="field">
        <input id="address-ward" v-model="form.ward" class="form-input" autocomplete="address-level3" :aria-describedby="field.describedby" :aria-invalid="field.invalid" />
      </FormField>
      <div class="sm:col-span-2">
        <FormField id="address-detail" label="Số nhà, ngõ / đường" required :error="errors.detail_address" v-slot="field">
          <input id="address-detail" v-model="form.detail_address" class="form-input" autocomplete="street-address" :aria-describedby="field.describedby" :aria-invalid="field.invalid" />
        </FormField>
      </div>
    </div>
    <label class="flex items-center gap-3 text-sm font-semibold text-slate-800">
      <input v-model="form.is_default" type="checkbox" class="h-4 w-4 rounded-md border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer" />
      <span>Đặt làm địa chỉ nhận hàng mặc định</span>
    </label>
    <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
      <AppButton variant="outline" @click="$emit('cancel')">Hủy</AppButton>
      <AppButton type="submit" :loading="loading">{{ submitLabel }}</AppButton>
    </div>
  </form>
</template>
<script setup>
import { reactive, watch } from 'vue';
import FormField from '../common/FormField.vue';
import AppButton from '../common/AppButton.vue';
import { validateAddressInput } from '../../utils/addressValidation.js';

const props = defineProps({ address: { type: Object, default: null }, loading: Boolean, submitLabel: { type: String, default: 'Lưu địa chỉ' } });
const emit = defineEmits(['submit', 'cancel']);
const empty = () => ({ receiver_name: '', receiver_phone: '', province: 'Hà Nội', district: '', ward: '', detail_address: '', is_default: false });
const form = reactive(empty());
const errors = reactive({});
function fill(address) { Object.assign(form, empty(), address ? { receiver_name: address.receiverName, receiver_phone: address.receiverPhone, province: address.province, district: address.district, ward: address.ward, detail_address: address.detailAddress, is_default: address.isDefault } : {}); Object.keys(errors).forEach((key) => delete errors[key]); }
watch(() => props.address, fill, { immediate: true });
function submit() { const result = validateAddressInput(form); Object.keys(errors).forEach((key) => delete errors[key]); Object.assign(errors, result.errors); if (result.isValid) emit('submit', result.data); }
</script>
<style scoped>
.form-input { @apply w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10; }
.form-input[aria-invalid="true"] { @apply border-red-500 focus:border-red-500 focus:ring-red-500/10; }
</style>
