<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-500/20 selection:text-rose-600">
    <header class="border-b border-slate-200/80 bg-white/95">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <router-link to="/" class="flex items-center gap-3" aria-label="Út Hân Cuốn, về trang chủ">
          <img src="/brand-mark.svg" alt="" class="h-9 w-9 sm:h-10 sm:w-10" />
          <span>
            <span class="block text-base font-bold leading-none text-ink sm:text-lg">{{ settingsStore.brandName }}</span>
            <span class="mt-1 block text-[9px] font-semibold uppercase tracking-editorial text-lacquer">Món cuốn Việt</span>
          </span>
        </router-link>

        <router-link to="/" class="inline-flex min-h-10 items-center gap-2 rounded-control px-2 text-sm font-semibold text-ink-muted hover:text-lacquer sm:px-3">
          <ArrowLeft class="h-4 w-4" aria-hidden="true" />
          <span class="hidden sm:inline">Về trang chủ</span>
          <span class="sm:hidden">Thực đơn</span>
        </router-link>
      </div>
    </header>

    <main id="auth-content" tabindex="-1" class="focus:outline-none">
      <router-view />
    </main>

    <footer class="border-t border-ink/10 px-4 py-5 text-center text-xs text-ink-muted">
      Cần hỗ trợ? Gọi <a :href="`tel:${settingsStore.hotline}`" class="font-semibold text-lacquer hover:underline">{{ settingsStore.hotline }}</a>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import { useSettingsStore } from '../stores/settingsStore.js';

const settingsStore = useSettingsStore();
onMounted(() => settingsStore.fetchSettings());
</script>
