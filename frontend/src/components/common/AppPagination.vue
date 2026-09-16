<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2">
    <!-- Item summary text -->
    <div v-if="totalItems !== undefined" class="text-xs text-foodText-muted">
      Hiển thị
      <span class="font-bold text-foodText">{{ startItem }}</span>
      -
      <span class="font-bold text-foodText">{{ endItem }}</span>
      trong tổng số
      <span class="font-bold text-primary">{{ totalItems }}</span>
      kết quả
    </div>
    <div v-else></div>

    <!-- Page Number Controls -->
    <div class="flex items-center gap-1.5">
      <!-- Previous Button -->
      <button
        type="button"
        @click="changePage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="w-9 h-9 flex items-center justify-center rounded-xl border border-amber-900/15 bg-white text-foodText hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition shadow-sm active:scale-95"
        title="Trang trước"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Page Numbers -->
      <template v-for="(p, idx) in visiblePages" :key="idx">
        <button
          v-if="p !== '...'"
          type="button"
          @click="changePage(p)"
          class="min-w-[36px] h-9 px-2 flex items-center justify-center rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
          :class="p === currentPage
            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
            : 'border border-amber-900/15 bg-white text-foodText hover:bg-amber-50'"
        >
          {{ p }}
        </button>
        <span v-else class="px-1 text-foodText-muted text-xs select-none">
          •••
        </span>
      </template>

      <!-- Next Button -->
      <button
        type="button"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="w-9 h-9 flex items-center justify-center rounded-xl border border-amber-900/15 bg-white text-foodText hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition shadow-sm active:scale-95"
        title="Trang sau"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    default: undefined,
  },
  pageSize: {
    type: Number,
    default: 12,
  },
});

const emit = defineEmits(['update:currentPage', 'change']);

const startItem = computed(() => {
  if (!props.totalItems || props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  if (!props.totalItems) return 0;
  return Math.min(props.currentPage * props.pageSize, props.totalItems);
});

const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const delta = 1;

  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

function changePage(page) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return;
  emit('update:currentPage', page);
  emit('change', page);
}
</script>
