<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight shadow-xs transition-colors"
    :class="styles[normalized] || styles.default"
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="[
        dotColors[normalized] || 'bg-current',
        ['pending', 'preparing', 'delivering'].includes(normalized) ? 'animate-pulse' : ''
      ]"
      aria-hidden="true"
    />
    <slot>{{ labels[normalized] || status }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
});

const normalized = computed(() => String(props.status).toLowerCase());

const labels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Bếp đang chuẩn bị',
  ready_for_pickup: 'Sẵn sàng giao',
  delivering: 'Đang giao hàng',
  completed: 'Giao thành công',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  deposited: 'Đã nhận cọc',
  deposit_paid: 'Đã nhận cọc',
};

const styles = {
  pending: 'border-amber-200 bg-amber-50/90 text-amber-700',
  confirmed: 'border-blue-200 bg-blue-50/90 text-blue-700',
  preparing: 'border-orange-200 bg-orange-50/90 text-orange-700',
  ready_for_pickup: 'border-teal-200 bg-teal-50/90 text-teal-700',
  delivering: 'border-indigo-200 bg-indigo-50/90 text-indigo-700',
  completed: 'border-emerald-200 bg-emerald-50/90 text-emerald-700',
  paid: 'border-emerald-200 bg-emerald-50/90 text-emerald-700',
  deposited: 'border-emerald-200 bg-emerald-50/90 text-emerald-700',
  deposit_paid: 'border-emerald-200 bg-emerald-50/90 text-emerald-700',
  unpaid: 'border-amber-200 bg-amber-50/90 text-amber-700',
  cancelled: 'border-rose-200 bg-rose-50/90 text-rose-700',
  refunded: 'border-purple-200 bg-purple-50/90 text-purple-700',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

const dotColors = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-orange-500',
  ready_for_pickup: 'bg-teal-500',
  delivering: 'bg-indigo-500',
  completed: 'bg-emerald-500',
  paid: 'bg-emerald-500',
  deposited: 'bg-emerald-500',
  deposit_paid: 'bg-emerald-500',
  unpaid: 'bg-amber-500',
  cancelled: 'bg-rose-500',
  refunded: 'bg-purple-500',
};
</script>

