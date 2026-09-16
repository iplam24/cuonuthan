<template>
  <div class="rounded-2xl border border-slate-200/70 bg-white shadow-soft transition-all duration-200" :class="className">
    <slot />
  </div>
</template>

<script setup>
defineProps({ className: { type: String, default: '' } });
</script>

