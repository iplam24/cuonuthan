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
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 mb-2">
            <Sparkles class="h-3.5 w-3.5" />
            <span>Thực đơn tươi ngon hôm nay</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Khám Phá Món Cuốn & Đặc Sản</h2>
          <p class="mt-1.5 text-sm text-slate-500">Món cuốn thanh mát, bò tơ tươi, lẩu ấm nồng và combo thịnh soạn giao tận cửa.</p>
        </div>

        <div class="hidden sm:flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div class="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Bếp sẵn sàng nhận đơn</span>
          </div>
          <div class="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span>{{ allProductsCount || totalItems }} món ăn</span>
          </div>
        </div>
      </div>

      <!-- Categories Pills Bar - Clean, Wide, Elegant & Touch-Friendly -->
      <nav class="mt-6" aria-label="Danh mục thực đơn">
        <div class="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 pt-1 scroll-smooth no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          <!-- All Categories Chip -->
          <button
            type="button"
            @click="selectCategory(null)"
            class="group relative inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-xs"
            :class="selectedCategoryId === null
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-500/20'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/40'"
            :aria-current="selectedCategoryId === null ? 'true' : undefined"
          >
            <span
              class="flex h-7 w-7 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              :class="selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'"
            >
              <Utensils class="h-4 w-4" />
            </span>
            <span>Tất cả món</span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-700'"
            >
              {{ allProductsCount || totalItems }}
            </span>
          </button>

          <!-- Individual Category Chips -->
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            @click="selectCategory(cat.id)"
            class="group relative inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-xs"
            :class="selectedCategoryId === cat.id
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-500/20'
              : 'bg-white text-slate-700 border border-slate-200/80 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/40'"
            :aria-pressed="selectedCategoryId === cat.id"
          >
            <span
              class="flex h-7 w-7 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              :class="selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'"
            >
              <component :is="getCategoryIcon(cat)" class="h-4 w-4" />
            </span>
            <span>{{ cat.name }}</span>
            <span
              v-if="cat.product_count !== undefined"
              class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="selectedCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-700'"
            >
              {{ cat.product_count }}
            </span>
          </button>
        </div>
      </nav>

      <!-- Advanced Filter & Search Toolbar (Lọc rộng & Dễ dùng hơn) -->
      <div class="mt-4 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all space-y-3.5">
        <!-- Search & Main Controls -->
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <!-- Search Input with Clear Button -->
          <div class="relative flex-1">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="menu-search"
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm theo tên món, đặc sản bò tơ, nem nướng, lẩu..."
              class="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
              @input="handleSearch"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
              title="Xóa tìm kiếm"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Controls: Quick Filter & Sort -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Featured Toggle -->
            <button
              type="button"
              @click="toggleFeatured"
              class="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-[0.98]"
              :class="isFeaturedOnly
                ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                : 'border-slate-200/90 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/30'"
            >
              <Star class="h-4 w-4" :class="isFeaturedOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'" />
              <span>Bán chạy / Nổi bật</span>
            </button>

            <!-- Sort Dropdown -->
            <div class="relative min-w-[170px] flex-1 sm:flex-initial">
              <div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ArrowUpDown class="h-4 w-4" />
              </div>
              <select
                id="menu-sort"
                v-model="selectedSort"
                @change="handleSortChange"
                class="w-full appearance-none cursor-pointer rounded-2xl border border-slate-200/90 bg-white py-3 pl-10 pr-9 text-xs sm:text-sm font-bold text-slate-700 hover:border-slate-300 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition shadow-2xs"
              >
                <option value="sort_order_asc">Bếp đề xuất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="newest">Món mới nhất</option>
                <option value="name_asc">Tên món: A - Z</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-bold">
                ▾
              </div>
            </div>
          </div>
        </div>

        <!-- Price Range Quick Filters -->
        <div class="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">
          <span class="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
            <Tag class="h-3.5 w-3.5 text-slate-400" />
            <span>Mức giá:</span>
          </span>

          <button
            v-for="pr in priceRanges"
            :key="pr.label"
            type="button"
            @click="selectPriceRange(pr)"
            class="rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98]"
            :class="selectedPriceRange?.label === pr.label
              ? 'bg-rose-600 text-white font-bold shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'"
          >
            {{ pr.label }}
          </button>
        </div>
      </div>

      <!-- Active Filters Tag Strip -->
      <div
        v-if="hasActiveFilter"
        class="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 px-4 py-2.5 text-xs animate-fadeIn"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-bold text-rose-700 flex items-center gap-1.5">
            <SlidersHorizontal class="h-3.5 w-3.5" />
            <span>Đang lọc:</span>
          </span>

          <!-- Category pill -->
          <span
            v-if="selectedCategoryName"
            class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-bold text-rose-700 shadow-2xs border border-rose-200"
          >
            {{ selectedCategoryName }}
            <button type="button" @click="selectCategory(null)" class="hover:text-rose-900 transition p-0.5">
              <X class="h-3 w-3" />
            </button>
          </span>

          <!-- Price pill -->
          <span
            v-if="selectedPriceRange && (selectedPriceRange.min != null || selectedPriceRange.max != null)"
            class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-bold text-rose-700 shadow-2xs border border-rose-200"
          >
            Giá: {{ selectedPriceRange.label }}
            <button type="button" @click="selectPriceRange(priceRanges[0])" class="hover:text-rose-900 transition p-0.5">
              <X class="h-3 w-3" />
            </button>
          </span>

          <!-- Featured pill -->
          <span
            v-if="isFeaturedOnly"
            class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-bold text-amber-700 shadow-2xs border border-amber-200"
          >
            Món nổi bật
            <button type="button" @click="toggleFeatured" class="hover:text-amber-900 transition p-0.5">
              <X class="h-3 w-3" />
            </button>
          </span>

          <!-- Search pill -->
          <span
            v-if="searchQuery"
            class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-bold text-slate-700 shadow-2xs border border-slate-200"
          >
            "{{ searchQuery }}"
            <button type="button" @click="clearSearch" class="hover:text-slate-900 transition p-0.5">
              <X class="h-3 w-3" />
            </button>
          </span>

          <span class="text-slate-500 font-medium ml-1">
            ({{ totalItems }} món phù hợp)
          </span>
        </div>

        <button
          type="button"
          @click="resetFilter"
          class="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-800 transition underline underline-offset-2"
        >
          <RotateCcw class="h-3 w-3" />
          <span>Xóa tất cả</span>
        </button>
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
import {
  Sparkles,
  ArrowRight,
  Search,
  Utensils,
  Beef,
  Soup,
  IceCreamCone,
  Package,
  Leaf,
  Star,
  Flame,
  Coffee,
  X,
  Tag,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-vue-next';
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

// Extended Filters
const priceRanges = [
  { label: 'Tất cả mức giá', min: null, max: null },
  { label: 'Dưới 100.000đ', min: null, max: 99999 },
  { label: '100.000đ – 200.000đ', min: 100000, max: 200000 },
  { label: 'Trên 200.000đ', min: 200001, max: null },
];
const selectedPriceRange = ref(priceRanges[0]);
const isFeaturedOnly = ref(false);

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

function getCategoryIcon(cat) {
  if (!cat) return Utensils;
  const slug = (cat.slug || '').toLowerCase();
  const name = (cat.name || '').toLowerCase();
  if (slug.includes('bo') || name.includes('bò')) return Beef;
  if (slug.includes('combo') || name.includes('combo')) return Package;
  if (slug.includes('lau') || name.includes('lẩu')) return Soup;
  if (slug.includes('nuong') || name.includes('nướng')) return Flame;
  if (slug.includes('do-uong') || name.includes('uống') || name.includes('tráng miệng')) return Coffee;
  if (slug.includes('rau') || slug.includes('phu') || name.includes('rau') || name.includes('phụ')) return Leaf;
  if (slug.includes('choi') || slug.includes('dong-que') || name.includes('chơi')) return Sparkles;
  return Utensils;
}

const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return '';
  const cat = categories.value.find((c) => c.id === selectedCategoryId.value);
  return cat ? cat.name : '';
});

const hasActiveFilter = computed(() => {
  return Boolean(
    selectedCategoryId.value !== null ||
    (selectedPriceRange.value && (selectedPriceRange.value.min != null || selectedPriceRange.value.max != null)) ||
    isFeaturedOnly.value ||
    (searchQuery.value && searchQuery.value.trim() !== '') ||
    selectedSort.value !== 'sort_order_asc'
  );
});

function clearSearch() {
  searchQuery.value = '';
  currentPage.value = 1;
  fetchProducts();
}

function selectPriceRange(range) {
  selectedPriceRange.value = range;
  currentPage.value = 1;
  fetchProducts();
}

function toggleFeatured() {
  isFeaturedOnly.value = !isFeaturedOnly.value;
  currentPage.value = 1;
  fetchProducts();
}

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
    const params = {
      sort: selectedSort.value,
      is_active: 1,
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (selectedCategoryId.value) params.category_id = selectedCategoryId.value;
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim();
    if (selectedPriceRange.value?.min != null) params.min_price = selectedPriceRange.value.min;
    if (selectedPriceRange.value?.max != null) params.max_price = selectedPriceRange.value.max;
    if (isFeaturedOnly.value) params.is_featured = 1;

    const res = await menuService.getProducts(params, { signal: controller.signal });
    if (id !== requestId) return;
    products.value = res.data.items || [];
    if (res.data.pagination) {
      totalItems.value = res.data.pagination.total;
      totalPages.value = res.data.pagination.totalPages;
      currentPage.value = res.data.pagination.page;
    } else {
      totalItems.value = products.value.length;
      totalPages.value = 1;
    }
    if (!selectedCategoryId.value && !searchQuery.value && !isFeaturedOnly.value && selectedPriceRange.value?.min == null && selectedPriceRange.value?.max == null) {
      allProductsCount.value = totalItems.value;
    }
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
  selectedPriceRange.value = priceRanges[0];
  isFeaturedOnly.value = false;
  selectedSort.value = 'sort_order_asc';
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
