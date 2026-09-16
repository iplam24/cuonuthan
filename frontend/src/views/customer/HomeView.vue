<template>
  <div class="space-y-12 pb-20">
    <!-- HERO SECTION -->
    <section class="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/20 to-slate-50/50 py-16 sm:py-24 border-b border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 shadow-xs">
              <span class="pulse-dot"></span>
              <span>Bếp Cuốn Truyền Thống · Nguyên Liệu Tươi Mới</span>
            </div>

            <h1 class="text-4xl sm:text-6xl font-extrabold leading-[1.12] tracking-tight text-slate-900">
              Đậm đà tinh hoa <br />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700">
                Món Cuốn Việt Nam
              </span>
            </h1>

            <p class="max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
              Thưởng thức Bò tơ Củ Chi dẻo ngọt, Nem nướng than hoa thơm lừng cuộn cùng bánh tráng phơi sương Trảng Bàng, mẹt rau rừng hái sớm và chén mắm nêm gia truyền 3 thế hệ nhà Út Hân.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a href="#menu-section" class="btn-lacquer-cta inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-soft">
                <span>Xem thực đơn & đặt món</span>
                <ArrowRight class="h-4 w-4" />
              </a>

              <router-link to="/tra-cuu" class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:border-rose-400 hover:text-rose-600 shadow-xs transition">
                <Search class="h-4 w-4" />
                <span>Tra cứu đơn hàng</span>
              </router-link>
            </div>

            <!-- Key Highlights Pill Badges -->
            <div class="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80">
              <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs text-center">
                <div class="text-xl font-extrabold text-slate-900">100%</div>
                <div class="text-[11px] text-slate-500 font-medium mt-0.5">Rau rừng sạch hái sớm</div>
              </div>
              <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs text-center">
                <div class="text-xl font-extrabold text-rose-600">{{ settingsStore.deliveryTime }}</div>
                <div class="text-[11px] text-slate-500 font-medium mt-0.5">Giao nóng tận cửa</div>
              </div>
              <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs text-center">
                <div class="text-xl font-extrabold text-emerald-600">VietQR</div>
                <div class="text-[11px] text-slate-500 font-medium mt-0.5">Khớp đơn tức thì</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5 relative flex justify-center">
            <div class="relative w-full max-w-md aspect-square overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lift group">
              <MediaImage
                src="/uploads/products/BoTuoiMoiNgay.jpg"
                alt="Bò tơ cuốn bánh tráng Út Hân"
                class="w-full h-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div class="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/60 bg-white/90 p-4 text-slate-900 shadow-lift backdrop-blur-xl">
                <div class="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">Đặc sản trứ danh</div>
                <div class="text-base font-bold text-slate-900 mt-0.5">Bò Tơ Cuốn Bánh Tráng Rau Rừng</div>
                <div class="text-xs text-slate-500 mt-0.5">Kèm mắm nêm cá cơm chua cay gia truyền</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MENU SECTION -->
    <section id="menu-section" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div class="border-b border-slate-200 pb-6">
        <div class="max-w-2xl">
          <div class="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
            <Sparkles class="h-4 w-4" />
            <span>Thực đơn tươi hôm nay</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Chọn món theo sở thích</h2>
          <p class="mt-1.5 text-sm text-slate-500">Món chính, combo tiệc, đồ uống giải nhiệt và đĩa kèm thơm ngon chuẩn vị.</p>
        </div>
      </div>

      <!-- Categories Segmented Control -->
      <nav class="mt-6" aria-label="Nhóm món ăn">
        <div class="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
          <button
            type="button"
            @click="selectCategory(null)"
            class="min-w-[10.5rem] snap-start rounded-2xl border p-4 text-left transition sm:min-w-0 shadow-xs"
            :class="selectedCategoryId === null ? 'border-rose-600 bg-rose-600 text-white shadow-soft' : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'"
            :aria-current="selectedCategoryId === null ? 'true' : undefined"
          >
            <span class="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl" :class="selectedCategoryId === null ? 'bg-white/20' : 'bg-rose-50 text-rose-600'"><Utensils class="h-4 w-4" /></span>
            <span class="block text-sm font-bold">Tất cả món</span>
            <span class="mt-0.5 block text-xs" :class="selectedCategoryId === null ? 'text-white/80' : 'text-slate-400'">{{ allProductsCount }} món ngon</span>
          </button>

          <section
            v-for="group in categoryGroups"
            :key="group.key"
            class="min-w-[12rem] snap-start rounded-2xl border p-4 transition sm:min-w-0 shadow-xs"
            :class="activeGroupKey === group.key ? 'border-rose-500 bg-rose-50/50 shadow-soft' : 'border-slate-200 bg-white'"
          >
            <div class="flex items-start gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" :class="activeGroupKey === group.key ? 'bg-rose-600 text-white' : 'bg-slate-100 text-rose-600'">
                <component :is="groupIcons[group.key]" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <h3 class="text-sm font-bold text-slate-900 leading-tight">{{ group.label }}</h3>
                <p class="mt-0.5 text-[11px] text-slate-400">{{ group.subtitle }}</p>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <button
                v-for="cat in group.categories"
                :key="cat.id"
                type="button"
                @click="selectCategory(cat.id)"
                class="rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition"
                :class="selectedCategoryId === cat.id ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-rose-400 hover:text-rose-600'"
                :aria-pressed="selectedCategoryId === cat.id"
              >{{ cat.name }}</button>
            </div>
          </section>
        </div>
      </nav>

      <!-- Search & Sort -->
      <div class="my-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-end">
        <div class="flex-1">
          <label for="menu-search" class="mb-1.5 block text-xs font-bold text-slate-700">Tìm trong thực đơn</label>
          <div class="relative">
            <input id="menu-search" v-model="searchQuery" type="search" placeholder="Nhập tên món bạn muốn tìm (VD: bò tơ, nem nướng...)" class="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition" @input="handleSearch" />
            <Search class="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>
        <div class="sm:w-56">
          <label for="menu-sort" class="mb-1.5 block text-xs font-bold text-slate-700">Sắp xếp</label>
          <select id="menu-sort" v-model="selectedSort" @change="handleSortChange" class="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition">
            <option value="sort_order_asc">Gợi ý từ Bếp</option>
            <option value="price_asc">Giá thấp đến cao</option>
            <option value="price_desc">Giá cao đến thấp</option>
            <option value="newest">Món mới nhất</option>
          </select>
        </div>
      </div>

      <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center" role="alert">
        <p class="font-bold text-rose-700">{{ error }}</p>
        <button @click="fetchProducts" class="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm">Thử lại</button>
      </div>

      <div v-else-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
        <div v-for="i in 8" :key="i" class="bg-white rounded-2xl p-4 animate-pulse space-y-3 border border-slate-100 shadow-sm">
          <div class="aspect-[4/3] bg-slate-100 rounded-xl"></div>
          <div class="h-3 bg-slate-100 rounded w-1/3"></div>
          <div class="h-5 bg-slate-100 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 rounded w-full"></div>
          <div class="h-9 bg-slate-100 rounded-xl w-full mt-4"></div>
        </div>
      </div>

      <div v-else-if="products.length > 0" class="space-y-8 pt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <FoodCard
            v-for="prod in products"
            :key="prod.id"
            :product="prod"
            @select="openDetailModal"
          />
        </div>

        <AppPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :page-size="pageSize"
          @update:current-page="handlePageChange"
        />
      </div>

      <EmptyState
        v-else
        title="Không tìm thấy món ăn phù hợp"
        description="Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác."
      >
        <template #icon>
          <Utensils class="h-6 w-6" />
        </template>
        <template #action>
          <AppButton @click="resetFilter">Xem lại tất cả món</AppButton>
        </template>
      </EmptyState>
    </section>

    <!-- STORY & BRAND VALUES SECTION -->
    <section id="about-section" class="bg-white py-16 sm:py-24 border-y border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-6 space-y-5">
            <div class="text-xs uppercase font-extrabold tracking-wider text-rose-600">
              Câu chuyện ẩm thực
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Bí quyết món cuốn Út Hân: <br />
              <span class="text-rose-600">Rau rừng tươi & Nước chấm độc bản</span>
            </h2>
            <p class="text-sm text-slate-600 leading-relaxed">
              Món cuốn ngon không chỉ nằm ở miếng thịt bò tơ mềm ngọt hay cây nem nướng nức mũi, mà chính là sự hòa quyện của hơn 10 loại lá rau rừng đặc sản và chén nước chấm pha chuẩn theo công thức gia truyền 3 thế hệ nhà Út Hân.
            </p>
            <div class="space-y-3 pt-2 text-sm font-medium text-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                <span>Rau rừng tự nhiên hái sớm: Lá cóc non, quế vị, đọt xoài, sao nhái, lá bứa...</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                <span>Bò tơ Củ Chi tươi mỗi ngày, luộc gừng thơm dẻo không bở.</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                <span>Mắm nêm cá cơm ủ thủ công, bùi béo dứa tươi xay nhuyễn.</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 grid grid-cols-2 gap-4">
            <div class="rounded-3xl overflow-hidden shadow-card border border-slate-100 aspect-square">
              <MediaImage
                src="/uploads/products/MenuCuonCaTheGioi.jpg"
                alt="Mẹt cuốn Út Hân"
                class="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div class="rounded-3xl overflow-hidden shadow-card border border-slate-100 aspect-square mt-6">
              <MediaImage
                src="/uploads/products/ComBoSieuVip.jpg"
                alt="Combo siêu vip"
                class="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REVIEWS & TESTIMONIALS SECTION -->
    <section class="border-t border-slate-200/60 bg-slate-50/60 py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div class="text-xs uppercase font-bold tracking-wider text-rose-600">Khách Hàng Nói Về Út Hân</div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">Cảm Nhận Thực Khách</h2>
          </div>
          <div v-if="reviewStats && reviewStats.total_reviews > 0" class="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div class="text-3xl font-extrabold text-rose-600">{{ reviewStats.avg_rating }}</div>
            <div class="text-xs text-slate-500">
              <div class="flex text-amber-400">
                <Star v-for="s in 5" :key="s" class="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <div class="mt-0.5 font-medium">{{ reviewStats.total_reviews }} lượt đánh giá thực đơn</div>
            </div>
          </div>
        </div>

        <div v-if="featuredReviews.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="rev in featuredReviews"
            :key="rev.id"
            class="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition duration-300"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center border border-rose-100">
                    {{ rev.customer_name ? rev.customer_name.charAt(0) : 'U' }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900">{{ rev.display_name || rev.customer_name }}</div>
                    <div class="text-[10px] text-slate-400">{{ rev.display_phone }}</div>
                  </div>
                </div>
                <div class="flex text-amber-400">
                  <Star
                    v-for="s in 5"
                    :key="s"
                    class="w-3.5 h-3.5"
                    :class="s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'"
                  />
                </div>
              </div>

              <p class="text-xs text-slate-600 leading-relaxed italic">
                "{{ rev.comment || 'Món ăn rất ngon, rau rừng tươi non, mắm nêm đậm đà chuẩn vị Út Hân!' }}"
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] text-slate-500">
              <span class="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 font-medium">🌿 Rau rừng: {{ rev.veggie_freshness_score || 5 }}/5</span>
              <span class="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 font-medium">🥣 Mắm nêm: {{ rev.sauce_rating || 5 }}/5</span>
            </div>
          </div>
        </div>

        <div v-else class="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2 shadow-xs">
          <p class="text-sm font-semibold text-slate-800">Bếp Út Hân luôn lắng nghe từng bữa ăn của quý khách.</p>
          <p class="text-xs text-slate-500">Hãy đặt món và gửi cảm nhận cho chúng tôi tại mục Tra cứu đơn hàng nhé!</p>
        </div>
      </div>
    </section>

    <!-- FOOD DETAIL MODAL -->
    <FoodDetailModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { menuService } from '../../services/menu.service.js';
import FoodCard from '../../components/food/FoodCard.vue';
import FoodDetailModal from '../../components/food/FoodDetailModal.vue';
import AppPagination from '../../components/common/AppPagination.vue';
import AppButton from '../../components/common/AppButton.vue';
import EmptyState from '../../components/common/EmptyState.vue';
import MediaImage from '../../components/common/MediaImage.vue';
import { Sparkles, ArrowRight, Search, Utensils, Beef, Soup, IceCreamCone, Package, Leaf, Star } from 'lucide-vue-next';
import { useSettingsStore } from '../../stores/settingsStore.js';
import { groupCategories, getCategoryGroup, getProductTypeLabel } from '../../utils/menuCategories.js';
import api from '../../services/api.js';

const settingsStore = useSettingsStore();

const categories = ref([]);
const products = ref([]);
const allProductsCount = ref(0);
const selectedCategoryId = ref(null);
const searchQuery = ref('');
const selectedSort = ref('sort_order_asc');
const loading = ref(false);
const error = ref('');
const selectedProduct = ref(null);
const featuredReviews = ref([]);
const reviewStats = ref(null);
let requestId = 0;
let controller = null;

// Pagination state
const currentPage = ref(1);
const pageSize = ref(12);
const totalPages = ref(1);
const totalItems = ref(0);

let searchTimeout = null;

const categoryGroups = computed(() => groupCategories(categories.value));
const activeGroupKey = computed(() => {
  if (!selectedCategoryId.value) return null;
  const cat = categories.value.find((c) => c.id === selectedCategoryId.value);
  return cat ? getCategoryGroup(cat).key : null;
});

const groupIcons = {
  main: Beef,
  combo: Package,
  hot: Soup,
  sides: Leaf,
  drinks: IceCreamCone,
};

async function fetchCategories() {
  try {
    const res = await menuService.getCategories();
    categories.value = res.data || [];
  } catch (err) {
    console.error('Lỗi tải danh mục:', err);
  }
}

async function fetchProducts() {
  loading.value = true;
  error.value = '';
  const id = ++requestId;
  controller?.abort();
  controller = new AbortController();
  try {
    const params = { sort: selectedSort.value, is_active: 1, page: currentPage.value, limit: pageSize.value };
    if (selectedCategoryId.value) params.category_id = selectedCategoryId.value;
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim();
    const res = await menuService.getProducts(params, { signal: controller.signal });
    if (id !== requestId) return;
    products.value = res.data.items || [];
    if (res.data.pagination) { totalItems.value = res.data.pagination.total; totalPages.value = res.data.pagination.totalPages; currentPage.value = res.data.pagination.page; } else { totalItems.value = products.value.length; totalPages.value = 1; }
    if (!selectedCategoryId.value && !searchQuery.value) allProductsCount.value = totalItems.value;
  } catch (err) {
    if (id === requestId && err.name !== 'AbortError') error.value = 'Không thể tải danh sách món ăn. Vui lòng thử lại.';
  } finally {
    if (id === requestId) loading.value = false;
  }
}

function selectCategory(id) {
  selectedCategoryId.value = id;
  currentPage.value = 1;
  fetchProducts();
}

function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 350);
}

function handleSortChange() {
  currentPage.value = 1;
  fetchProducts();
}

function handlePageChange(newPage) {
  currentPage.value = newPage;
  fetchProducts();
  const menuEl = document.getElementById('menu-section');
  if (menuEl) {
    menuEl.scrollIntoView({ behavior: 'smooth' });
  }
}

function resetFilter() {
  searchQuery.value = '';
  selectedCategoryId.value = null;
  currentPage.value = 1;
  fetchProducts();
}

function openDetailModal(product) {
  selectedProduct.value = product;
}

async function loadReviews() {
  try {
    const res = await api.get('/reviews/featured');
    const data = res.data?.data || res.data || {};
    featuredReviews.value = data.reviews || [];
    reviewStats.value = data.stats || null;
  } catch (err) {
    // Gracefully handle if reviews table is empty
    featuredReviews.value = [];
  }
}

onMounted(() => {
  fetchCategories();
  fetchProducts();
  loadReviews();
});
</script>
