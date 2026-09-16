<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-rose-500/10 selection:text-rose-600 flex flex-col justify-between">
    <Header />
    <main id="main-content" tabindex="-1" class="flex-1 pb-20 focus:outline-none">
      <router-view />
    </main>
    <Footer />
    <FloatingContact />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Header from '../components/common/Header.vue';
import Footer from '../components/common/Footer.vue';
import FloatingContact from '../components/common/FloatingContact.vue';
import { useSettingsStore } from '../stores/settingsStore.js';

const settingsStore = useSettingsStore();
onMounted(() => settingsStore.fetchSettings());
</script>
