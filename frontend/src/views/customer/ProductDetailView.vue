<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
      <router-link to="/" class="hover:text-rose-600 transition-colors">Trang chủ</router-link>
      <span class="text-slate-300">/</span>
      <span class="text-slate-500">{{ product?.category_name || 'Món cuốn' }}</span>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">{{ product?.name || 'Chi tiết món' }}</span>
    </nav>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
      <div class="lg:col-span-7 aspect-video bg-slate-200 rounded-3xl"></div>
      <div class="lg:col-span-5 space-y-4">
        <div class="h-4 bg-slate-200 rounded w-1/4"></div>
        <div class="h-8 bg-slate-200 rounded w-3/4"></div>
        <div class="h-6 bg-slate-200 rounded w-1/3"></div>
        <div class="h-24 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-3xl border border-rose-200 bg-rose-50/80 p-10 text-center shadow-sm" role="alert">
      <p class="font-bold text-rose-800">{{ error }}</p>
      <button @click="loadProduct" class="mt-4 rounded-xl bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-sm font-bold text-white shadow-soft transition">
        Thử lại
      </button>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      <!-- Left: Image Gallery & Reassurance -->
      <div class="lg:col-span-7 space-y-5">
        <div class="aspect-[4/3] sm:aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-soft relative group">
          <MediaImage :src="selectedImage || product.primary_image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          
          <div
            v-if="product.is_out_of_stock"
            class="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center"
          >
            <span class="bg-rose-600 text-white font-bold text-sm uppercase px-5 py-2 rounded-full shadow-lg tracking-wider">
              Tạm Hết Suất Hôm Nay
            </span>
          </div>

          <!-- Quality Badge Overlay -->
          <div v-else class="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-bold text-slate-800">Cuốn Tươi Tại Bếp</span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div v-if="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-2" role="list">
          <button
            v-for="(img, idx) in product.images"
            :key="idx"
            @click="selectedImage = img.image_url"
            class="w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all shadow-xs"
            :class="selectedImage === img.image_url ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md scale-105' : 'border-transparent opacity-75 hover:opacity-100'"
            :aria-label="`Xem ảnh ${idx + 1}`"
            role="listitem"
          >
            <img :src="getFullImageUrl(img.image_url)" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Culinary Reassurance Box -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div class="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              🌿
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900">Rau Rừng Tươi</div>
              <div class="text-[11px] text-slate-500">Chuẩn sạch VietGAP</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 font-bold shrink-0">
              🥣
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900">Mắm Nêm Gia Truyền</div>
              <div class="text-[11px] text-slate-500">Đậm đà chuẩn vị Út Hân</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 font-bold shrink-0">
              ⚡
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900">Giao Nhanh 30P</div>
              <div class="text-[11px] text-slate-500">Đóng gói giữ giòn & nóng</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Details & Ordering Panel -->
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-xs font-extrabold uppercase tracking-wider text-rose-600">
            {{ product.category_name || 'Đặc sản Út Hân' }}
          </div>
          <h1 class="font-extrabold text-2xl sm:text-3xl text-slate-900 mt-2 tracking-tight">
            {{ product.name }}
          </h1>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-3 pb-4 border-b border-slate-100">
          <span class="font-extrabold text-3xl sm:text-4xl text-rose-600 font-mono tracking-tight">
            {{ formatVND(product.price) }}
          </span>
          <span v-if="product.original_price" class="text-sm text-slate-400 line-through">
            {{ formatVND(product.original_price) }}
          </span>
          <span class="text-xs font-semibold text-slate-500">/ 1 {{ product.unit || 'phần' }}</span>
        </div>

        <!-- Description -->
        <div class="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
          {{ product.description || product.short_description || 'Món cuốn đặc sản trứ danh của Bếp Út Hân, kết hợp bánh tráng phơi sương, rau rừng đa dạng và nước chấm gia truyền độc đáo.' }}
        </div>

        <!-- Allergens Alert -->
        <div v-if="product.allergens" class="text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-center gap-2.5">
          <AlertCircle class="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span><strong>Lưu ý thành phần:</strong> {{ product.allergens }}</span>
        </div>

        <!-- Kitchen Note Input -->
        <div class="space-y-1.5">
          <label for="product-note" class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Ghi chú riêng cho Bếp
          </label>
          <input
            id="product-note"
            v-model="note"
            type="text"
            placeholder="Ví dụ: không hành, mắm nêm để riêng, nhiều rau..."
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
          />
        </div>

        <!-- Add to cart -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Số lượng:</span>
            <QuantityStepper v-model="quantity" />
          </div>

          <button
            v-if="!product.is_out_of_stock"
            @click="addToCart"
            class="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:brightness-105 active:scale-[0.98] text-white font-bold text-base py-4 px-6 rounded-2xl shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2.5"
          >
            <ShoppingBag class="w-5 h-5" />
            <span>Thêm vào giỏ • {{ formatVND(product.price * quantity) }}</span>
          </button>
          <button
            v-else
            disabled
            class="w-full bg-slate-200 text-slate-400 font-bold py-4 rounded-2xl cursor-not-allowed text-center text-sm"
          >
            Món Ăn Đã Hết Suất Trong Ngày
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { menuService } from '../../services/menu.service.js';
import { useCartStore } from '../../stores/cartStore.js';
import { getFullImageUrl, formatVND } from '../../config/app.config.js';
import { toast } from '../../utils/toast.js';
import { ShoppingBag, AlertCircle } from 'lucide-vue-next';
import QuantityStepper from '../../components/common/QuantityStepper.vue';
import MediaImage from '../../components/common/MediaImage.vue';

const route = useRoute();
const cartStore = useCartStore();

const product = ref(null);
const selectedImage = ref(null);
const quantity = ref(1);
const note = ref('');
const loading = ref(false);
const error = ref('');

async function loadProduct() {
  loading.value = true;
  error.value = '';
  try {
    const res = await menuService.getProductDetail(route.params.idOrSlug);
    product.value = res.data;
    selectedImage.value = res.data.primary_image;
  } catch (err) {
    error.value = 'Không tìm thấy món ăn hoặc xảy ra lỗi kết nối.';
  } finally {
    loading.value = false;
  }
}

function addToCart() {
  if (!product.value) return;
  try {
    cartStore.addItem(product.value, quantity.value, note.value);
    toast.success(`Đã thêm ${quantity.value} phần "${product.value.name}" vào giỏ!`);
  } catch (err) {
    toast.error(err.message);
  }
}

onMounted(loadProduct);
watch(() => route.params.idOrSlug, () => { quantity.value = 1; product.value = null; loadProduct(); });
</script>
