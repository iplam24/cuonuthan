<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3"><div v-for="i in 2" :key="i" class="h-20 animate-pulse rounded-2xl bg-rice-deep"></div></div>
    <div v-else-if="!addresses.length" class="rounded-2xl border border-dashed border-ink/15 bg-rice-deep p-6 text-center text-sm text-ink-muted">Bạn chưa có địa chỉ nào được lưu.</div>
    <div v-else class="grid gap-3 sm:grid-cols-2">
      <button v-for="address in addresses" :key="address.id" type="button" class="group relative flex flex-col items-start gap-2 rounded-2xl border bg-white p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lacquer" :class="selectedId === address.id ? 'border-lacquer ring-2 ring-lacquer/15' : 'border-ink/10 hover:border-lacquer/40'" @click="select(address.id)">
        <span class="flex w-full items-start justify-between gap-2"><strong class="text-sm text-ink">{{ address.receiverName }}</strong><span v-if="address.isDefault" class="rounded-full bg-lacquer/10 px-2 py-0.5 text-[10px] font-bold text-lacquer">Mặc định</span></span>
        <span class="text-xs text-ink-muted">{{ address.receiverPhone }}</span>
        <span class="text-xs leading-relaxed text-ink-muted">{{ address.formattedAddress }}</span>
      </button>
    </div>
    <div class="flex flex-wrap gap-2 pt-2">
      <AppButton size="sm" variant="outline" @click="$emit('open-form')">+ Thêm địa chỉ mới</AppButton>
      <AppButton v-if="selectedId && selectedId !== defaultId" size="sm" variant="ghost" @click="$emit('set-default', selectedId)">Đặt làm mặc định</AppButton>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import AppButton from '../common/AppButton.vue';
const props = defineProps({ addresses: { type: Array, default: () => [] }, selectedId: { type: [Number, String], default: null }, loading: Boolean });
const emit = defineEmits(['select', 'open-form', 'set-default']);
const defaultId = computed(() => props.addresses.find((item) => item.isDefault)?.id ?? null);
function select(id) { if (props.selectedId !== id) emit('select', id); }
</script>
