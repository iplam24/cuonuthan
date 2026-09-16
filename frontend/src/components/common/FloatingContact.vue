<template>
  <aside class="fixed bottom-22 right-5 z-40 hidden flex-col items-end gap-2.5 pointer-events-none md:flex" aria-label="Kênh liên hệ nhanh">
    <!-- Hotline Button -->
    <a
      :href="`tel:${settingsStore.hotline}`"
      class="group pointer-events-auto flex items-center gap-2 rounded-full bg-emerald-600 text-white px-3.5 py-2.5 shadow-lift hover:bg-emerald-700 transition-all duration-200 hover:scale-105"
      title="Gọi hotline Út Hân"
      aria-label="Gọi hotline Út Hân"
    >
      <Phone class="h-4 w-4" />
      <span class="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-xs">
        {{ settingsStore.hotline }}
      </span>
    </a>

    <!-- Zalo Button -->
    <a
      v-if="settingsStore.zalo"
      :href="settingsStore.zaloUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="group pointer-events-auto flex items-center gap-2 rounded-full bg-[#0068FF] text-white px-3.5 py-2.5 shadow-lift hover:bg-[#0052cc] transition-all duration-200 hover:scale-105"
      title="Chat Zalo tư vấn món"
      aria-label="Chat Zalo tư vấn món"
    >
      <span class="text-xs font-extrabold tracking-tight">Zalo</span>
      <span class="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 group-hover:max-w-xs">
        Tư vấn nhanh
      </span>
    </a>

    <!-- Messenger Button -->
    <a
      v-if="settingsStore.facebook"
      :href="settingsStore.facebook"
      target="_blank"
      rel="noopener noreferrer"
      class="group pointer-events-auto flex items-center gap-2 rounded-full bg-white border border-slate-200 text-slate-800 px-3.5 py-2.5 shadow-lift hover:border-rose-400 hover:text-rose-600 transition-all duration-200 hover:scale-105"
      title="Nhắn tin Messenger"
      aria-label="Nhắn tin Messenger"
    >
      <MessageCircle class="h-4 w-4 text-[#0084FF]" />
      <span class="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 group-hover:max-w-xs">
        Messenger
      </span>
    </a>
  </aside>
</template>

<script setup>
import { useSettingsStore } from '../../stores/settingsStore.js';
import { Phone, MessageCircle } from 'lucide-vue-next';

const settingsStore = useSettingsStore();
</script>
