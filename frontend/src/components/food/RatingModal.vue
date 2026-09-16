<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity" @click.self="$emit('close')">
    <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col relative animate-fade-in border border-slate-100">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <div class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600">
            <span class="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Đánh giá món ăn</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mt-0.5 font-mono">Đơn hàng #{{ orderCode }}</h3>
        </div>
        <button
          @click="$emit('close')"
          class="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-xs"
          aria-label="Đóng"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
        <!-- Overall Rating Stars -->
        <div class="text-center space-y-2 bg-gradient-to-b from-amber-50/50 to-transparent p-5 rounded-2xl border border-amber-100/60">
          <div class="text-sm font-bold text-slate-800">Bạn cảm thấy bữa ăn thế nào?</div>
          <div class="flex items-center justify-center gap-2.5 pt-1">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
              @click="rating = star"
            >
              <Star
                class="w-8 h-8 transition-colors drop-shadow-xs"
                :class="star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
              />
            </button>
          </div>
          <div class="text-xs font-bold text-rose-600 pt-1">
            {{ ratingLabels[rating] }}
          </div>
        </div>

        <!-- Detailed Criteria -->
        <div class="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 space-y-3">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chấm điểm chi tiết</div>

          <!-- Món cuốn -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-700 font-semibold">🌯 Chất lượng món cuốn:</span>
            <div class="flex gap-1">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                @click="foodQuality = s"
                class="p-1 transition-transform hover:scale-110 active:scale-90"
              >
                <Star class="w-4 h-4" :class="s <= foodQuality ? 'fill-amber-400 text-amber-400' : 'text-slate-200'" />
              </button>
            </div>
          </div>

          <!-- Mắm nêm & Nước chấm -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-700 font-semibold">🥣 Hương vị nước chấm / Mắm nêm:</span>
            <div class="flex gap-1">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                @click="sauceRating = s"
                class="p-1 transition-transform hover:scale-110 active:scale-90"
              >
                <Star class="w-4 h-4" :class="s <= sauceRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'" />
              </button>
            </div>
          </div>

          <!-- Rau rừng -->
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-700 font-semibold">🌿 Độ tươi giòn của rau rừng:</span>
            <div class="flex gap-1">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                @click="veggieFreshness = s"
                class="p-1 transition-transform hover:scale-110 active:scale-90"
              >
                <Star class="w-4 h-4" :class="s <= veggieFreshness ? 'fill-amber-400 text-amber-400' : 'text-slate-200'" />
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Tags -->
        <div class="space-y-2">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gợi ý cảm nhận nhanh:</div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in quickTags"
              :key="tag"
              type="button"
              @click="toggleTag(tag)"
              class="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
              :class="comment.includes(tag) ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- Comment Textarea -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Nhận xét & góp ý cho Bếp
          </label>
          <textarea
            v-model.trim="comment"
            rows="3"
            placeholder="Món ăn có hợp khẩu vị bạn không? Rau và mắm nêm thế nào?..."
            class="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
          ></textarea>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Footer Action -->
      <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          @click="$emit('close')"
        >
          Để sau
        </button>
        <AppButton
          type="button"
          :loading="submitting"
          @click="submitReview"
        >
          Gửi đánh giá
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { X, Star } from 'lucide-vue-next';
import AppButton from '../common/AppButton.vue';
import api from '../../services/api.js';
import { toast } from '../../utils/toast.js';

const props = defineProps({
  orderCode: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    default: '',
  },
  trackingToken: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'submitted']);

const rating = ref(5);
const foodQuality = ref(5);
const sauceRating = ref(5);
const veggieFreshness = ref(5);
const comment = ref('');
const submitting = ref(false);
const errorMessage = ref('');

const ratingLabels = {
  1: 'Chưa hài lòng 😞',
  2: 'Cần cải thiện thêm 😐',
  3: 'Bình thường 🙂',
  4: 'Ngon miệng & hài lòng! 😊',
  5: 'Tuyệt vời, chuẩn vị cuốn Út Hân! 🌟',
};

const quickTags = [
  'Rau rất tươi sạch 🌿',
  'Mắm nêm pha chuẩn vị 🥣',
  'Giao nhanh & nóng hổi ⚡',
  'Cuốn đầy đặn chắc tay 🌯',
  'Đóng gói sạch sẽ chu đáo 📦',
  'Bánh tráng phơi sương mềm dẻo 🌾',
];

function toggleTag(tag) {
  if (comment.value.includes(tag)) {
    comment.value = comment.value.replace(tag, '').replace(/,\s*,/g, ',').trim();
  } else {
    comment.value = comment.value ? `${comment.value}, ${tag}` : tag;
  }
}

async function submitReview() {
  errorMessage.value = '';
  submitting.value = true;
  try {
    const res = await api.post(`/reviews/${props.orderCode}`, {
      rating: rating.value,
      food_quality_score: foodQuality.value,
      sauce_rating: sauceRating.value,
      veggie_freshness_score: veggieFreshness.value,
      comment: comment.value,
      phone: props.customerPhone,
      trackingToken: props.trackingToken,
    });

    toast.success(res.data?.message || 'Cảm ơn bạn đã gửi đánh giá!');
    emit('submitted');
    emit('close');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Không thể gửi đánh giá. Vui lòng thử lại!';
  } finally {
    submitting.value = false;
  }
}
</script>
