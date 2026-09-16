<template>
  <SurfaceCard className="p-5 sm:p-6 h-full flex flex-col gap-4" :class="address.isDefault ? 'ring-2 ring-rose-500/30 shadow-md' : ''">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-bold text-base text-slate-900">{{ address.receiverName }}</h3>
        <p class="text-xs text-slate-500 font-mono mt-0.5">{{ address.receiverPhone }}</p>
      </div>
      <span v-if="address.isDefault" class="rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 shadow-xs">Mặc định</span>
    </div>
    <p class="text-sm leading-relaxed text-slate-600 flex-1">{{ address.formattedAddress }}</p>
    <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
      <AppButton v-if="!address.isDefault" size="sm" variant="outline" :loading="pending === `default:${address.id}`" @click="$emit('default', address.id)">Đặt mặc định</AppButton>
      <AppButton size="sm" variant="ghost" @click="$emit('edit', address)">Sửa</AppButton>
      <AppButton size="sm" variant="danger" :loading="pending === `delete:${address.id}`" @click="$emit('delete', address)">Xóa</AppButton>
    </div>
  </SurfaceCard>
</template>
<script setup>
import AppButton from '../common/AppButton.vue';
import SurfaceCard from '../common/SurfaceCard.vue';
defineProps({ address: { type: Object, required: true }, pending: { type: String, default: '' } });
defineEmits(['default', 'edit', 'delete']);
</script>
