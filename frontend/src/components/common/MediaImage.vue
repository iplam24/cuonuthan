<template><img :src="source" :alt="alt" :loading="loading" @error="useFallback" /></template>
<script setup>
import { ref, watch } from 'vue';
import { getFullImageUrl } from '../../config/app.config.js';
const props = defineProps({ src: { type: String, default: '' }, alt: { type: String, required: true }, loading: { type: String, default: 'lazy' } });
const source = ref(getFullImageUrl(props.src));
watch(() => props.src, value => { source.value = getFullImageUrl(value); });
function useFallback() { source.value = '/food-placeholder.svg'; }
</script>
