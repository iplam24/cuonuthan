<template>
  <div>
    <!-- Desktop Footer: Luxury Dark Obsidian -->
    <footer class="hidden md:block border-t border-slate-800 bg-slate-950 px-4 py-16 text-slate-400">
      <div class="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand column -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center">
              <img src="/brand-mark.svg" alt="Út Hân Logo" class="h-7 w-7 object-contain" />
            </div>
            <span class="text-xl font-extrabold text-white tracking-tight">
              {{ settingsStore.brandName }}
            </span>
          </div>
          <p class="max-w-xs text-xs leading-relaxed text-slate-400">
            {{ settingsStore.brandSlogan || 'Món cuốn chuẩn vị truyền thống. Bò tơ tươi mới mỗi ngày, rau rừng Tây Ninh thanh mát và mắm nêm gia truyền đậm đà.' }}
          </p>
          <div class="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full font-medium">
            <span class="pulse-dot"></span>
            <span>Phục vụ giao nóng tận nơi</span>
          </div>
        </div>

        <!-- Quick Menu -->
        <div>
          <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Thực đơn nổi bật</h3>
          <ul class="space-y-2.5 text-xs text-slate-400">
            <li><router-link to="/" class="hover:text-rose-400 transition">Bò tơ cuốn bánh tráng rau rừng</router-link></li>
            <li><router-link to="/" class="hover:text-rose-400 transition">Nem nướng Nha Trang than hoa</router-link></li>
            <li><router-link to="/" class="hover:text-rose-400 transition">Mẹt cuốn cả thế giới Út Hân</router-link></li>
            <li><router-link to="/" class="hover:text-rose-400 transition">Combo tiệc cuốn siêu VIP</router-link></li>
          </ul>
        </div>

        <!-- Support & Help -->
        <div>
          <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Dịch vụ & Hỗ trợ</h3>
          <ul class="space-y-2.5 text-xs text-slate-400">
            <li><router-link to="/tra-cuu" class="hover:text-rose-400 transition">Tra cứu tiến độ đơn hàng</router-link></li>
            <li><router-link to="/dat-mon" class="hover:text-rose-400 transition">Giỏ hàng & Đặt tiệc</router-link></li>
            <li><span class="text-slate-500">Chính sách cam kết đồ ăn tươi nóng</span></li>
            <li><span class="text-slate-500">Hạn mức & chính sách đặt cọc</span></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="space-y-3 text-xs text-slate-400">
          <h3 class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Liên hệ Bếp</h3>
          <p class="flex items-start gap-2.5">
            <MapPin class="mt-0.5 h-4 w-4 text-rose-500 shrink-0" />
            <span>{{ settingsStore.address }}</span>
          </p>
          <p class="flex items-center gap-2.5">
            <Phone class="h-4 w-4 text-emerald-500 shrink-0" />
            <a :href="`tel:${settingsStore.hotline}`" class="font-bold text-white hover:text-rose-400 transition">
              {{ settingsStore.hotline }}
            </a>
          </p>
          <p v-if="settingsStore.email" class="flex items-center gap-2.5">
            <Mail class="h-4 w-4 text-amber-500 shrink-0" />
            <a :href="`mailto:${settingsStore.email}`" class="hover:text-white transition">
              {{ settingsStore.email }}
            </a>
          </p>
          <p class="flex items-center gap-2.5">
            <Clock class="h-4 w-4 text-slate-400 shrink-0" />
            <span>Mở cửa: {{ settingsStore.businessHours }}</span>
          </p>
          <div class="pt-4 text-[11px] text-slate-600 border-t border-slate-900">
            © {{ new Date().getFullYear() }} {{ settingsStore.brandName }}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>

    <!-- Mobile Footer: Clean Light Seamless Minimalist -->
    <footer class="md:hidden border-t border-slate-200/70 bg-slate-50/80 px-4 py-8 pb-28 text-center text-xs text-slate-500 space-y-2.5">
      <div class="flex items-center justify-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-2xs border border-slate-200">
          <img src="/brand-mark.svg" alt="Út Hân Logo" class="h-4 w-4 object-contain" />
        </div>
        <span class="font-extrabold text-slate-900 text-sm tracking-tight">
          {{ settingsStore.brandName }}
        </span>
      </div>
      <p class="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
        {{ settingsStore.address }}
      </p>
      <div class="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
        <span>Hotline:</span>
        <a :href="`tel:${settingsStore.hotline}`" class="text-rose-600 font-bold">
          {{ settingsStore.hotline }}
        </a>
      </div>
      <p class="text-[10px] text-slate-400 pt-1">
        © {{ new Date().getFullYear() }} {{ settingsStore.brandName }}. All rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../../stores/settingsStore.js';
import { MapPin, Phone, Clock, Mail } from 'lucide-vue-next';

const settingsStore = useSettingsStore();
</script>
