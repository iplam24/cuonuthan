<template><div class="fixed inset-x-4 bottom-20 z-[70] ml-auto flex max-w-sm flex-col gap-2 pointer-events-none md:bottom-5 md:right-5" aria-live="polite"><transition-group enter-active-class="transition duration-200" enter-from-class="translate-y-2 opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0"><div v-for="item in toasts" :key="item.id" class="pointer-events-auto flex items-start gap-3 rounded-card border bg-surface-card p-4 text-sm text-ink shadow-lift" :class="tones[item.type] || tones.info"><component :is="getIcon(item.type)" class="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true"/><span class="flex-1 leading-5">{{ item.message }}</span></div></transition-group></div></template>
<script setup>
import { toasts } from '../../utils/toast.js';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next';
const tones = { success: 'border-herb/25 [&>svg]:text-herb', error: 'border-lacquer/25 [&>svg]:text-lacquer', warning: 'border-ochre/35 [&>svg]:text-ochre-dark', info: 'border-ink/15 [&>svg]:text-ink-muted' };
function getIcon(type) { return type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : type === 'warning' ? AlertTriangle : Info; }
</script>
