<template>
  <article
    class="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/70 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-slate-300"
    :class="{ 'opacity-60 grayscale-30': product.is_out_of_stock }"
  >
    <!-- Food Image Container -->
    <router-link
      :to="`/mon-an/${product.id}`"
      class="relative block aspect-[4/3] overflow-hidden bg-slate-100 focus-visible:ring-2 focus-visible:ring-rose-500"
    >
      <MediaImage
        :src="product.primary_image"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- Out of Stock Badge -->
      <span
        v-if="product.is_out_of_stock"
        class="absolute inset-x-3 bottom-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-center text-xs font-bold text-white rounded-xl shadow-sm"
      >
        Tạm hết hàng hôm nay
      </span>

      <!-- Daily Stock Urgency Badge -->
      <span
        v-else-if="product.current_stock != null && product.current_stock > 0 && product.current_stock <= 5"
        class="absolute inset-x-3 bottom-3 bg-amber-500/95 backdrop-blur-md px-2.5 py-1 text-center text-[11px] font-extrabold text-white rounded-xl shadow-sm flex items-center justify-center gap-1.5"
      >
        <Flame class="w-3.5 h-3.5 text-amber-100" />
        <span>Chỉ còn {{ product.current_stock }} suất hôm nay!</span>
      </span>

      <!-- Discount Percentage Tag -->
      <span
        v-else-if="discountPercent > 0"
        class="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
      >
        -{{ discountPercent }}%
      </span>
    </router-link>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <!-- Category Tagline -->
      <p class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
        {{ product.category_name || (product.is_side_dish ? 'Món ăn kèm' : 'Đặc sản cuốn') }}
      </p>

      <!-- Dish Name -->
      <router-link
        :to="`/mon-an/${product.id}`"
        class="mt-1 font-bold text-base sm:text-lg leading-snug text-slate-900 tracking-tight group-hover:text-rose-600 transition focus-visible:underline"
      >
        {{ product.name }}
      </router-link>

      <!-- Subtype / Type Label -->
      <span
        v-if="typeLabel"
        class="mt-1.5 inline-flex w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
      >
        {{ typeLabel }}
      </span>

      <!-- Short Description -->
      <p class="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500">
        {{ product.short_description || product.description || 'Chuẩn bị từ nguyên liệu tươi mới trong ngày.' }}
      </p>

      <!-- Price & Action -->
      <div class="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3.5">
        <div>
          <p class="text-lg sm:text-xl font-extrabold text-rose-600 tracking-tight">
            {{ formatVND(product.price) }}
          </p>
          <p
            v-if="product.original_price && product.original_price > product.price"
            class="text-[11px] text-slate-400 line-through font-medium"
          >
            {{ formatVND(product.original_price) }}
          </p>
        </div>

        <button
          v-if="!product.is_out_of_stock"
          @click.stop.prevent="quickAdd(product)"
          class="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-glow active:scale-95 transition-all"
          aria-label="Thêm vào giỏ"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Thêm</span>
        </button>
        <span v-else class="pb-1 text-xs text-slate-400 font-medium">
          Tạm hết
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { formatVND } from '../../config/app.config.js';
import { useCartStore } from '../../stores/cartStore.js';
import { toast } from '../../utils/toast.js';
import { getProductTypeLabel } from '../../utils/menuCategories.js';
import { Plus, Flame } from 'lucide-vue-next';
import MediaImage from '../common/MediaImage.vue';

const props = defineProps({
  product: { type: Object, required: true },
});
defineEmits(['select']);

const cartStore = useCartStore();

const discountPercent = computed(() => {
  if (props.product.original_price && props.product.original_price > props.product.price) {
    return Math.round(((props.product.original_price - props.product.price) / props.product.original_price) * 100);
  }
  return 0;
});

const typeLabel = computed(() => getProductTypeLabel(props.product));

function quickAdd(product) {
  try {
    cartStore.addItem(product, 1);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  } catch (err) {
    toast.error(err.message);
  }
}
</script>
