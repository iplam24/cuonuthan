<template>
  <div id="app">
    <router-view />
    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSettingsStore } from './stores/settingsStore.js';
import Toast from './components/common/Toast.vue';

const settingsStore = useSettingsStore();

onMounted(() => {
  settingsStore.fetchSettings();
});
</script>
