<template>
  <component
    :is="to ? 'router-link' : href ? 'a' : 'button'"
    :to="to"
    :href="href"
    :type="!to && !href ? type : undefined"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl border font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none"
    :class="[sizes[size] || sizes.md, variants[variant] || variants.primary]"
  >
    <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
    <slot />
  </component>
</template>

<script setup>
import { LoaderCircle } from 'lucide-vue-next';

defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  loading: Boolean,
  disabled: Boolean,
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'primary' },
});

const sizes = {
  sm: 'min-h-[38px] px-3.5 py-1.5 text-xs',
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[50px] px-6 py-3 text-base',
};

const variants = {
  primary: 'border-transparent bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white font-bold shadow-soft hover:shadow-glow hover:brightness-105 active:scale-[0.98]',
  secondary: 'border-slate-200/80 bg-slate-100/90 text-slate-800 font-semibold hover:bg-slate-200/80 hover:text-slate-900 active:scale-[0.98]',
  outline: 'border-slate-200 bg-white text-slate-700 font-semibold hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/40 active:scale-[0.98]',
  danger: 'border-transparent bg-red-600 text-white font-semibold hover:bg-red-700 active:scale-[0.98]',
  ghost: 'border-transparent bg-transparent text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 font-semibold active:scale-[0.98]',
  accent: 'border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-soft hover:brightness-105 active:scale-[0.98]',
};
</script>

