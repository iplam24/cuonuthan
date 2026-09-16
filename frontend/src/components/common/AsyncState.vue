<template>
  <div v-if="loading" class="py-12 text-center" role="status" aria-live="polite">
    <LoaderCircle class="mx-auto h-7 w-7 animate-spin text-lacquer" aria-hidden="true" />
    <p class="mt-2 text-sm text-ink-muted">{{ loadingText }}</p>
  </div>
  <div v-else-if="error" class="rounded-card border border-lacquer/20 bg-lacquer/5 p-6 text-center" role="alert">
    <AlertCircle class="mx-auto h-8 w-8 text-lacquer" aria-hidden="true" />
    <p class="mt-2 font-semibold text-lacquer-dark">{{ error }}</p>
    <AppButton v-if="retryable" class="mt-4" size="sm" @click="$emit('retry')">Thử lại</AppButton>
  </div>
  <div v-else-if="empty" class="rounded-card border border-ink/10 bg-surface-card p-10 text-center shadow-soft"><slot name="empty" /></div>
  <slot v-else />
</template>
<script setup>
import { LoaderCircle, AlertCircle } from 'lucide-vue-next';
import AppButton from './AppButton.vue';
defineProps({ loading: Boolean, error: { type: String, default: '' }, empty: Boolean, retryable: { type: Boolean, default: true }, loadingText: { type: String, default: 'Đang tải dữ liệu...' } });
defineEmits(['retry']);
</script>
