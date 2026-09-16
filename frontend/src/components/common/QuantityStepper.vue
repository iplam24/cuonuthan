<template>
  <div class="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs select-none" role="group" :aria-label="label">
    <button
      type="button"
      class="h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      :disabled="modelValue <= min"
      :aria-label="`Giảm ${label.toLowerCase()}`"
      @click="$emit('update:modelValue', Math.max(min, modelValue - 1))"
    >
      <Minus class="h-4 w-4" />
    </button>
    <output class="min-w-[2.25rem] text-center text-sm font-bold text-slate-900 tabular-nums" :aria-label="`${label}: ${modelValue}`">
      {{ modelValue }}
    </output>
    <button
      type="button"
      class="h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      :disabled="modelValue >= max"
      :aria-label="`Tăng ${label.toLowerCase()}`"
      @click="$emit('update:modelValue', Math.min(max, modelValue + 1))"
    >
      <Plus class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup>
import { Minus, Plus } from 'lucide-vue-next';

defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  label: { type: String, default: 'Số lượng' },
});

defineEmits(['update:modelValue']);
</script>

