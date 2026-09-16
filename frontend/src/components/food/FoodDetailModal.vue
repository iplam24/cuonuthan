<template>
  <div v-if="product" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity" @click.self="close" @keydown.esc="close">
    <div ref="dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" class="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative fade-in zoom-in-95 duration-200 border border-slate-100">
      <!-- Close button -->
      <button
        @click="close"
        class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition shadow-md"
        aria-label="Đóng"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="overflow-y-auto flex-1">
        <!-- Main Image -->
        <div class="relative aspect-video w-full bg-slate-100">
          <MediaImage :src="activeImage || product.primary_image" :alt="product.name" class="w-full h-full object-cover" />
          <div
            v-if="product.is_out_of_stock"
            class="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center"
          >
            <span class="bg-rose-600 text-white font-bold text-sm uppercase px-5 py-2 rounded-full shadow-lg tracking-wider">
              Món Ăn Tạm Hết Suất
            </span>
          </div>
        </div>

        <!-- Thumbnails if images exist -->
        <div v-if="product.images && product.images.length > 1" class="flex gap-2.5 p-3 bg-slate-50 overflow-x-auto">
          <button
            v-for="(img, idx) in product.images"
            :key="idx"
            @click="activeImage = img.image_url"
            class="w-16 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all shadow-xs"
            :class="activeImage === img.image_url ? 'border-rose-600 ring-2 ring-rose-500/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'"
          >
            <img :src="getFullImageUrl(img.image_url)" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Details -->
        <div class="p-6 sm:p-7 space-y-4">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600">
              <span>{{ product.category_name || 'Đặc sản Út Hân' }}</span>
              <span v-if="product.prep_time_minutes" class="text-slate-400 font-normal">• Chuẩn bị ~{{ product.prep_time_minutes }} phút</span>
            </div>
            <h2 :id="titleId" class="font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 tracking-tight">{{ product.name }}</h2>
            <div v-if="product.current_stock != null && product.current_stock > 0 && product.current_stock <= 5" class="mt-2 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
              <span>🔥 Chỉ còn {{ product.current_stock }} suất tươi hôm nay!</span>
            </div>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-3">
            <span class="font-extrabold text-2xl sm:text-3xl text-rose-600 tracking-tight">
              {{ formatVND(product.price) }}
            </span>
            <span v-if="product.original_price && product.original_price > product.price" class="text-sm text-slate-400 line-through font-medium">
              {{ formatVND(product.original_price) }}
            </span>
            <span class="text-xs text-slate-500 font-medium">/ 1 {{ product.unit || 'phần' }}</span>
          </div>

          <!-- Description -->
          <div class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {{ product.description || product.short_description || 'Món ăn đặc sản tươi ngon được chuẩn bị tỉ mỉ từ nguyên liệu tươi trong ngày.' }}
          </div>

          <!-- Allergens / Notes -->
          <div v-if="product.allergens" class="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-amber-600 shrink-0" />
            <span>Lưu ý thành phần: {{ product.allergens }}</span>
          </div>

          <!-- Special instructions input -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              Ghi chú cho bếp (tuỳ chọn)
            </label>
            <input
              v-model="customNote"
              type="text"
              placeholder="VD: Không lấy ớt, nhiều mắm nêm, để riêng rau thơm..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
            />
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
        <!-- Quantity counter -->
        <div class="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xs">
          <button
            @click="quantity = Math.max(1, quantity - 1)"
            class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-extrabold text-slate-700"
            :disabled="quantity <= 1"
          >
            -
          </button>
          <span class="font-bold text-base min-w-[24px] text-center text-slate-900">{{ quantity }}</span>
          <button
            @click="quantity = (product.current_stock != null ? Math.min(product.current_stock, quantity + 1) : quantity + 1)"
            class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-extrabold text-slate-700 disabled:opacity-40"
            :disabled="product.current_stock != null && quantity >= product.current_stock"
          >
            +
          </button>
        </div>

        <!-- Add to Cart CTA -->
        <button
          v-if="!product.is_out_of_stock"
          @click="addToCart"
          class="flex-1 btn-lacquer-cta font-bold py-3.5 px-6 rounded-2xl shadow-soft flex items-center justify-center gap-2"
        >
          <ShoppingBag class="w-5 h-5" />
          <span>Thêm vào giỏ • {{ formatVND(product.price * quantity) }}</span>
        </button>
        <button
          v-else
          disabled
          class="flex-1 bg-slate-200 text-slate-400 font-bold py-3.5 px-6 rounded-2xl cursor-not-allowed text-center"
        >
          Món hiện đang hết hàng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { getFullImageUrl, formatVND } from '../../config/app.config.js';
import MediaImage from '../common/MediaImage.vue';
import { useCartStore } from '../../stores/cartStore.js';
import { toast } from '../../utils/toast.js';
import { X, ShoppingBag, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);
const cartStore = useCartStore();

const quantity = ref(1);
const customNote = ref('');
const activeImage = ref(props.product?.primary_image || null);
const dialog = ref(null);
const titleId = 'modal-title';
let previousFocus = null;

function close() { emit('close'); }

onMounted(async () => {
  previousFocus = document.activeElement;
  await nextTick();
  dialog.value?.focus();
});
onUnmounted(() => { previousFocus?.focus?.(); });

function addToCart() {
  if (!props.product) return;
  try {
    cartStore.addItem(props.product, quantity.value, customNote.value);
    toast.success(`Đã thêm ${quantity.value} phần "${props.product.name}" vào giỏ!`);
    emit('close');
  } catch (err) {
    toast.error(err.message);
  }
}
</script>
