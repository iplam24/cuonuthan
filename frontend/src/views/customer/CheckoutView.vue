<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Breadcrumb & Header -->
    <div class="mb-8 space-y-2">
      <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <router-link to="/" class="hover:text-rose-600 transition">Trang chủ</router-link>
        <span>/</span>
        <span class="text-slate-800 font-semibold">Hoàn tất đặt món</span>
      </div>
      <div class="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 class="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Xác Nhận Đặt Món
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            Bếp Út Hân cuộn bánh tráng và hái rau rừng tươi mới ngay khi bạn xác nhận đơn.
          </p>
        </div>
        <div v-if="cartStore.items.length > 0 && !submittedOrder" class="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
          <span class="pulse-dot"></span>
          <span>Bếp đang sẵn sàng nguyên liệu tươi</span>
        </div>
      </div>
    </div>

    <!-- Empty Cart State -->
    <div v-if="cartStore.items.length === 0 && !submittedOrder" class="text-center py-16 bg-white rounded-3xl border border-slate-200/80 max-w-xl mx-auto p-8 shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
        <ShoppingBag class="w-8 h-8" />
      </div>
      <h2 class="font-extrabold text-2xl text-slate-900">Giỏ hàng của bạn đang trống</h2>
      <p class="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
        Thưởng thức bò tơ cuộn dẻo ngọt, mẹt nem nướng than hoa và rau rừng Tây Ninh hái sớm từ Bếp Út Hân nhé!
      </p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 mt-6 px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition"
      >
        <span>Khám phá thực đơn</span>
        <ArrowRight class="w-4 h-4" />
      </router-link>
    </div>

    <!-- MAIN CHECKOUT 2-COLUMN VIEW -->
    <div v-else-if="!submittedOrder" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Cart items & Delivery Details -->
      <div class="lg:col-span-7 space-y-6">
        <!-- 1. Cart Items Card -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 text-rose-600">
                <Utensils class="w-4 h-4" />
              </span>
              <div>
                <h2 class="font-bold text-base sm:text-lg text-slate-900">Món ăn đã chọn</h2>
                <p class="text-xs text-slate-400">{{ cartStore.itemCount }} phần ăn trong giỏ</p>
              </div>
            </div>
            <button
              @click="confirmClearCart"
              class="text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
            >
              Làm trống giỏ
            </button>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="py-4 sm:py-5 flex items-start gap-4 transition hover:bg-slate-50/50 rounded-xl px-2"
            >
              <!-- Image Thumbnail -->
              <img
                :src="getFullImageUrl(item.primary_image)"
                :alt="item.name"
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0 shadow-xs border border-slate-100"
              />

              <!-- Item Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="font-bold text-sm sm:text-base text-slate-900 leading-snug">{{ item.name }}</h3>
                    <div class="font-extrabold text-sm text-rose-600 mt-0.5">
                      {{ formatVND(item.price) }}
                    </div>
                  </div>
                  <button
                    @click="cartStore.removeItem(item.id)"
                    class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title="Bỏ món này"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>

                <!-- Quantity Stepper & Price -->
                <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
                  <div class="inline-flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 shadow-xs">
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center font-extrabold text-xs text-slate-700 hover:bg-rose-600 hover:text-white transition"
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span class="text-xs font-bold px-3 text-slate-900">{{ item.quantity }}</span>
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      class="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center font-extrabold text-xs text-slate-700 hover:bg-rose-600 hover:text-white transition"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>

                  <span class="font-extrabold text-sm text-slate-900">
                    {{ formatVND(item.price * item.quantity) }}
                  </span>
                </div>

                <!-- Dish specific custom note -->
                <div class="mt-2.5">
                  <input
                    :value="item.note"
                    @input="cartStore.updateNote(item.id, $event.target.value)"
                    type="text"
                    placeholder="Ghi chú khẩu vị cho bếp (VD: nhiều mắm nêm, không hành...)"
                    class="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Delivery Information Card -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-50 text-amber-600">
                <MapPin class="w-4 h-4" />
              </span>
              <div>
                <h2 class="font-bold text-base sm:text-lg text-slate-900">Địa chỉ & Người nhận món</h2>
                <p class="text-xs text-slate-400">Bếp Út Hân sẽ giao đồ ăn nóng hổi tới tận nơi</p>
              </div>
            </div>
          </div>

          <!-- Saved Address Picker for logged in user -->
          <div v-if="authStore.isAuthenticated" class="space-y-3">
            <AddressPicker
              :addresses="addressStore.addresses"
              :selected-id="addressStore.selectedAddressId"
              :loading="addressStore.loading"
              @select="selectSavedAddress"
              @open-form="addressFormOpen = true"
              @set-default="setCheckoutDefault"
            />
            <button
              v-if="addressStore.selectedAddress"
              type="button"
              class="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
              @click="useManualAddress = !useManualAddress"
            >
              <span>{{ useManualAddress ? '← Dùng địa chỉ đã lưu' : 'Giao tới địa chỉ khác cho đơn này' }}</span>
            </button>
          </div>

          <!-- Manual / Non-auth Address Inputs -->
          <div v-if="!addressStore.selectedAddress || useManualAddress" class="space-y-4 pt-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Name Input -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  <User class="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Họ và tên người nhận <span class="text-rose-500 font-bold">*</span>
                </label>
                <input
                  v-model="form.customer_name"
                  type="text"
                  placeholder="Ví dụ: Chị Lan, Anh Hùng"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
                  required
                />
              </div>

              <!-- Phone Input -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  <Phone class="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  Số điện thoại nhận hàng <span class="text-rose-500 font-bold">*</span>
                </label>
                <input
                  v-model="form.customer_phone"
                  type="tel"
                  placeholder="Ví dụ: 0988 888 888"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
                  required
                />
              </div>
            </div>

            <!-- Province / District / Ward Inputs -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Khu vực giao hàng
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  v-model="form.delivery_province"
                  placeholder="Tỉnh / Thành phố"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
                />
                <input
                  v-model="form.delivery_district"
                  placeholder="Quận / Huyện"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
                />
                <input
                  v-model="form.delivery_ward"
                  placeholder="Phường / Xã"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
                />
              </div>
            </div>

            <!-- Detail Address Input -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                <MapPin class="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Địa chỉ chi tiết <span class="text-rose-500 font-bold">*</span>
              </label>
              <input
                v-model="form.delivery_address"
                type="text"
                placeholder="Số nhà, tên ngõ/ngách, tên tòa nhà hoặc căn hộ..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
                required
              />
            </div>

            <label v-if="authStore.isAuthenticated && !addressStore.selectedAddress" class="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                v-model="saveNewAddress"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span class="font-medium">Lưu địa chỉ này vào sổ địa chỉ cá nhân</span>
            </label>
          </div>

          <!-- Delivery Time Selector -->
          <div class="pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold text-slate-700 mb-2">
              Thời gian nhận món
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                @click="form.delivery_time_type = 'now'"
                class="p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3"
                :class="form.delivery_time_type === 'now' ? 'border-2 border-rose-600 bg-rose-50/30 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
              >
                <div class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300" :class="form.delivery_time_type === 'now' ? 'border-rose-600 bg-rose-600' : ''">
                  <div v-if="form.delivery_time_type === 'now'" class="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Clock class="w-4 h-4 text-rose-600" />
                    <span>Giao ngay lập tức</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    Bếp làm nóng & giao trong {{ settingsStore.deliveryTime }}
                  </div>
                </div>
              </div>

              <div
                @click="form.delivery_time_type = 'scheduled'"
                class="p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3"
                :class="form.delivery_time_type === 'scheduled' ? 'border-2 border-rose-600 bg-rose-50/30 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
              >
                <div class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300" :class="form.delivery_time_type === 'scheduled' ? 'border-rose-600 bg-rose-600' : ''">
                  <div v-if="form.delivery_time_type === 'scheduled'" class="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Calendar class="w-4 h-4 text-amber-600" />
                    <span>Hẹn giờ giao hôm nay</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    Chọn khung giờ nhận món tiện nhất
                  </div>
                </div>
              </div>
            </div>

            <!-- Time Picker if Scheduled -->
            <div v-if="form.delivery_time_type === 'scheduled'" class="mt-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
              <span class="text-xs text-slate-700 font-bold">Giờ muốn nhận:</span>
              <input
                v-model="form.scheduled_delivery_time"
                type="time"
                class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <span class="text-[11px] text-slate-400">(Bếp sẽ giao đúng khung giờ này)</span>
            </div>
          </div>

          <!-- Note for Shipper -->
          <div class="pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              <MessageSquare class="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Lời nhắn cho tài xế giao hàng
            </label>
            <input
              v-model="form.delivery_note"
              type="text"
              placeholder="Ví dụ: Giao lên tầng 4, gọi trước 5 phút để xuống nhận..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary & Payment -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-card space-y-5 sticky top-24">
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="font-extrabold text-xl text-slate-900 tracking-tight">Chi Tiết Đơn Hàng</h2>
              <p class="text-xs text-slate-400">Tóm tắt món ăn & thanh toán</p>
            </div>
            <div class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              Bếp Út Hân
            </div>
          </div>

          <!-- Price breakdown -->
          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Tạm tính món ăn:</span>
              <span class="font-bold text-slate-900">{{ formatVND(cartStore.subtotal) }}</span>
            </div>

            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5">
                <span class="text-slate-500">Phí giao hàng:</span>
                <span
                  v-if="cartStore.shippingFee === 0"
                  class="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200"
                >
                  Freeship
                </span>
              </div>
              <span class="font-bold text-slate-900">
                {{ cartStore.shippingFee === 0 ? '0 ₫' : formatVND(cartStore.shippingFee) }}
              </span>
            </div>

            <!-- Discount Row if Applied -->
            <div v-if="cartStore.discountAmount > 0" class="flex justify-between items-center text-emerald-600 font-bold">
              <div class="flex items-center gap-1">
                <Tag class="w-3.5 h-3.5" />
                <span>Ưu đãi giảm giá:</span>
              </div>
              <span>-{{ formatVND(cartStore.discountAmount) }}</span>
            </div>

            <!-- Free shipping encouragement banner -->
            <div
              v-if="cartStore.subtotal < settingsStore.freeShippingThreshold"
              class="text-xs text-amber-800 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2"
            >
              <Sparkles class="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Thêm <strong>{{ formatVND(settingsStore.freeShippingThreshold - cartStore.subtotal) }}</strong> để được Bếp bao phí ship!
              </span>
            </div>

            <!-- Voucher Section -->
            <div class="border-t border-b border-slate-100 py-3.5 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gift class="w-3.5 h-3.5 text-rose-600" />
                  Mã Giảm Giá / Voucher
                </span>
                <span v-if="cartStore.coupon" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Đã áp dụng
                </span>
              </div>

              <!-- Applied Voucher Card -->
              <div
                v-if="cartStore.coupon"
                class="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs"
              >
                <div class="flex items-center gap-2">
                  <Tag class="w-4 h-4 text-emerald-700" />
                  <div>
                    <span class="font-mono font-bold text-emerald-900">{{ cartStore.coupon.code }}</span>
                    <span class="text-emerald-700 ml-1.5 font-medium">-{{ formatVND(cartStore.discountAmount) }}</span>
                  </div>
                </div>
                <button
                  type="button"
                  @click="handleRemoveCoupon"
                  title="Hủy mã này"
                  class="text-slate-400 hover:text-rose-600 font-bold px-2 py-1 rounded-lg hover:bg-white transition"
                >
                  ✕
                </button>
              </div>

              <!-- Coupon Input Form -->
              <div v-else class="flex gap-2">
                <input
                  v-model="couponCodeInput"
                  type="text"
                  placeholder="Nhập mã ưu đãi..."
                  class="flex-1 px-3 py-2 uppercase rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition"
                  @keyup.enter="handleApplyCoupon"
                />
                <button
                  type="button"
                  @click="handleApplyCoupon"
                  :disabled="validatingCoupon || !couponCodeInput.trim()"
                  class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {{ validatingCoupon ? '...' : 'Áp Dụng' }}
                </button>
              </div>

              <!-- Suggested Coupon Chips -->
              <div class="flex flex-wrap gap-1.5 items-center pt-0.5">
                <span class="text-[10px] text-slate-400">Gợi ý:</span>
                <button
                  v-for="code in ['CHAOBANMOI', 'FREESHIP', 'UTHANVIP10', 'CUONNGON30K']"
                  :key="code"
                  type="button"
                  @click="quickApplyCoupon(code)"
                  class="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 font-mono font-semibold text-slate-600 transition"
                >
                  {{ code }}
                </button>
              </div>
            </div>

            <!-- Loyalty Points Section -->
            <div
              v-if="authStore.isAuthenticated && userLoyalty && userLoyalty.points?.available > 0"
              class="border-b border-slate-100 pb-3.5 space-y-2 bg-amber-50/40 p-3 rounded-xl border border-amber-200/50"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award class="w-4 h-4 text-amber-600" />
                  Điểm Thưởng Hội Viên
                </span>
                <span class="text-[11px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
                  {{ userLoyalty.points.available }} điểm
                </span>
              </div>
              <label class="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  v-model="useLoyaltyPoints"
                  class="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <span class="font-medium">
                  Dùng điểm giảm giá (tối đa giảm {{ formatVND(maxPointsDiscount) }})
                </span>
              </label>
              <div v-if="useLoyaltyPoints && calculatedPointsUsed > 0" class="flex justify-between text-xs text-amber-700 font-bold pt-1">
                <span>Khấu trừ ({{ calculatedPointsUsed }} điểm):</span>
                <span>-{{ formatVND(calculatedPointsUsed * 1000) }}</span>
              </div>
            </div>

            <!-- Grand Total -->
            <div class="pt-2 flex justify-between items-baseline">
              <span class="font-extrabold text-base text-slate-900">Tổng thanh toán:</span>
              <span class="font-extrabold text-3xl text-rose-600 tracking-tight">
                {{ formatVND(effectiveTotal) }}
              </span>
            </div>
          </div>

          <!-- Quality Guarantee & Deposit Alert -->
          <div
            v-if="cartStore.isDepositRequired"
            class="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs space-y-1.5"
          >
            <div class="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck class="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cam kết chuẩn bị nguyên liệu tươi mới</span>
            </div>
            <p class="text-[11px] text-amber-900/90 leading-relaxed">
              Với đơn đặt tiệc / đơn giá trị trên {{ formatVND(settingsStore.depositThreshold) }}, quý khách vui lòng đặt cọc trước
              <strong class="text-rose-600 font-bold">{{ formatVND(cartStore.depositAmount) }}</strong> qua VietQR để bếp tuyển chọn mẻ bò tơ và rau tươi ngon nhất.
            </p>
          </div>

          <!-- Payment Method Choices -->
          <div class="space-y-3 pt-1">
            <label class="block text-xs font-bold text-slate-800">
              Phương thức thanh toán <span class="text-rose-500">*</span>
            </label>

            <!-- VietQR Option -->
            <div
              @click="form.payment_method = 'banking'"
              class="p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3"
              :class="form.payment_method === 'banking' ? 'border-2 border-rose-600 bg-rose-50/30 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
            >
              <div class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300" :class="form.payment_method === 'banking' ? 'border-rose-600 bg-rose-600' : ''">
                <div v-if="form.payment_method === 'banking'" class="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-xs sm:text-sm text-slate-900">Chuyển khoản VietQR</span>
                  <span class="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                    Khuyên dùng · Tự động duyệt
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 mt-1 leading-normal">
                  Quét mã QR bằng App mọi Ngân hàng (VCB, MB, Techcombank...). Tự động khớp lệnh tức thì.
                </p>
              </div>
            </div>

            <!-- COD Option -->
            <div
              @click="form.payment_method = 'cod'"
              class="p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3"
              :class="form.payment_method === 'cod' ? 'border-2 border-rose-600 bg-rose-50/30 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
            >
              <div class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300" :class="form.payment_method === 'cod' ? 'border-rose-600 bg-rose-600' : ''">
                <div v-if="form.payment_method === 'cod'" class="h-1.5 w-1.5 rounded-full bg-white"></div>
              </div>
              <div class="flex-1">
                <div class="font-bold text-xs sm:text-sm text-slate-900">Tiền mặt khi nhận món (COD)</div>
                <p class="text-[11px] text-slate-500 mt-1 leading-normal">
                  Thanh toán trực tiếp cho tài xế khi nhận đồ ăn nóng hổi.
                  <span v-if="cartStore.isDepositRequired" class="text-rose-600 block font-semibold mt-0.5">
                    * Cần cọc {{ formatVND(cartStore.depositAmount) }} qua VietQR trước.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Main dish requirement warning -->
          <div
            v-if="cartStore.items.length > 0 && !cartStore.hasMainDish"
            class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900"
          >
            <div class="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chưa có món chính trong đơn</span>
            </div>
            <p class="text-[11px] leading-relaxed text-amber-800">
              Bếp Út Hân phục vụ đồ uống và món kèm khi có ít nhất 1 món cuốn chính (Bò tơ cuốn bánh tráng, Nem nướng...).
            </p>
            <router-link to="/" class="inline-block text-rose-600 font-bold hover:underline pt-1 text-xs">
              + Xem thực đơn món chính →
            </router-link>
          </div>

          <!-- Submit Order CTA Button -->
          <button
            @click="handleSubmitOrder"
            :disabled="submitting || cartStore.items.length === 0 || !cartStore.hasMainDish"
            class="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base py-4 rounded-2xl shadow-soft hover:shadow-glow active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting">Bếp đang tiếp nhận đơn...</span>
            <span v-else class="flex items-center gap-2">
              <span>Xác Nhận Đặt Món</span>
              <span class="opacity-60">•</span>
              <span>{{ formatVND(effectiveTotal) }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ORDER SUCCESS & VIETQR CONFIRMATION SCREEN -->
    <div v-else class="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-lift space-y-7">
      <div class="text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 class="w-9 h-9" />
        </div>
        <div>
          <span class="text-xs uppercase font-extrabold tracking-wider text-emerald-600">BẾP ĐÃ TIẾP NHẬN</span>
          <h2 class="font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 tracking-tight">
            Đặt Món Thành Công!
          </h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Cảm ơn bạn đã lựa chọn Bếp Út Hân. Đội ngũ đầu bếp đang chuẩn bị ra món nóng hổi ngay cho bạn.
        </p>
        <div class="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-500">Mã đơn hàng:</span>
          <span class="font-mono font-bold text-rose-600 text-lg">{{ submittedOrder.order_code }}</span>
          <button
            @click="copyText(submittedOrder.order_code, 'mã đơn hàng')"
            class="text-slate-400 hover:text-rose-600 p-1"
            title="Sao chép mã đơn"
          >
            <Copy class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- VietQR Section if Banking or Deposit required -->
      <div
        v-if="submittedOrder.vietqr"
        class="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 text-center"
      >
        <div class="font-bold text-lg text-slate-900">
          {{ submittedOrder.payment_method === 'banking' ? 'Quét Mã VietQR Thanh Toán' : 'Quét Mã VietQR Đặt Cọc' }}
        </div>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Mở ứng dụng Ngân hàng trên điện thoại để quét mã bên dưới. Số tiền và nội dung đã được điền tự động chính xác:
        </p>

        <!-- QR Code Image -->
        <div class="inline-block bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200">
          <img
            :src="submittedOrder.vietqr.qr_url"
            alt="Mã VietQR Chuyển Khoản"
            class="w-60 h-60 mx-auto object-contain"
          />
        </div>

        <div class="text-xs font-mono bg-white p-4 rounded-xl border border-slate-200 max-w-sm mx-auto space-y-2 text-left shadow-xs">
          <div class="flex justify-between">
            <span class="text-slate-500 font-sans">Ngân hàng:</span>
            <strong class="text-slate-900">{{ submittedOrder.vietqr.bank_id }}</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 font-sans">Số tài khoản:</span>
            <div class="flex items-center gap-1.5">
              <strong class="text-slate-900">{{ submittedOrder.vietqr.account_no }}</strong>
              <button @click="copyText(submittedOrder.vietqr.account_no, 'số tài khoản')" class="text-rose-600 hover:underline">
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-sans">Chủ tài khoản:</span>
            <strong class="text-slate-900">{{ submittedOrder.vietqr.account_name }}</strong>
          </div>
          <div class="flex justify-between items-center border-t border-slate-100 pt-1.5">
            <span class="text-slate-500 font-sans">Số tiền:</span>
            <strong class="text-rose-600 text-sm font-bold">{{ formatVND(submittedOrder.vietqr.amount) }}</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500 font-sans">Nội dung CK:</span>
            <div class="flex items-center gap-1.5">
              <strong class="text-rose-600">{{ submittedOrder.vietqr.syntax }}</strong>
              <button @click="copyText(submittedOrder.vietqr.syntax, 'nội dung CK')" class="text-rose-600 hover:underline">
                <Copy class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Proof Upload -->
        <div class="pt-2">
          <label class="block text-xs font-semibold text-slate-600 mb-2">
            Đã chuyển khoản xong? Tải ảnh biên lai để bếp xác nhận siêu tốc:
          </label>
          <div class="flex justify-center">
            <input
              type="file"
              accept="image/*"
              @change="handleProofUpload"
              class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer"
            />
          </div>
          <p v-if="proofUploaded" class="text-xs text-emerald-600 font-bold mt-2">
            ✓ Đã gửi ảnh biên lai! Bếp đang đối soát và duyệt ngay.
          </p>
        </div>
      </div>

      <!-- Quán Direct Contact -->
      <div class="space-y-3 pt-2">
        <div class="text-xs text-center font-semibold text-slate-500">
          Cần hỗ trợ đơn gấp? Liên hệ trực tiếp với quán:
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            v-if="settingsStore.zalo"
            :href="`https://zalo.me/${settingsStore.zalo}?text=${encodeURIComponent('Chào Út Hân, mình vừa đặt đơn hàng ' + submittedOrder.order_code + ' với tổng tiền ' + formatVND(submittedOrder.total_amount) + '. Nhờ quán kiểm tra giúp mình nhé!')}`"
            target="_blank"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0068FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-xs transition"
          >
            <span>Nhắn Zalo Quán</span>
          </a>
          <a
            v-if="settingsStore.facebook"
            :href="settingsStore.facebook"
            target="_blank"
            class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0084ff] hover:bg-[#0074e0] text-white font-bold text-xs shadow-xs transition"
          >
            <span>Nhắn Messenger</span>
          </a>
        </div>
      </div>

      <!-- Action Navigation -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
        <router-link
          :to="`/tra-cuu/${submittedOrder.order_code}`"
          class="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm text-center shadow-soft transition"
        >
          Theo dõi tiến độ món ăn
        </router-link>
        <router-link
          to="/"
          class="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm text-center transition"
        >
          Về trang chủ thực đơn
        </router-link>
      </div>
    </div>

    <!-- Address Creation Modal -->
    <div v-if="addressFormOpen" class="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center sm:p-4" @click.self="addressFormOpen = false" @keydown.esc="addressFormOpen = false">
      <SurfaceCard className="max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 sm:max-w-2xl sm:rounded-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="checkout-address-title">
        <h2 id="checkout-address-title" class="mb-5 text-xl font-extrabold text-slate-900">Thêm địa chỉ giao hàng</h2>
        <AddressForm :loading="addressStore.pending === 'create'" @cancel="addressFormOpen = false" @submit="createCheckoutAddress" />
      </SurfaceCard>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useCartStore } from '../../stores/cartStore.js';
import { useOrderStore } from '../../stores/orderStore.js';
import { useSettingsStore } from '../../stores/settingsStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useAddressStore } from '../../stores/addressStore.js';
import { api } from '../../services/api.js';
import { getFullImageUrl, formatVND } from '../../config/app.config.js';
import { toast } from '../../utils/toast.js';
import SurfaceCard from '../../components/common/SurfaceCard.vue';
import AddressPicker from '../../components/address/AddressPicker.vue';
import AddressForm from '../../components/address/AddressForm.vue';
import { validateAddressInput } from '../../utils/addressValidation.js';
import {
  ShoppingBag,
  Utensils,
  MapPin,
  Clock,
  Calendar,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Tag,
  Gift,
  Award,
  User,
  Phone,
  MessageSquare,
  Copy,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next';

const userLoyalty = ref(null);
const useLoyaltyPoints = ref(false);

const maxPointsDiscount = computed(() => Math.floor(cartStore.subtotal * 0.20));

const calculatedPointsUsed = computed(() => {
  if (!useLoyaltyPoints.value || !userLoyalty.value) return 0;
  const available = userLoyalty.value.points?.available || 0;
  return Math.min(available, Math.floor(maxPointsDiscount.value / 1000));
});

const effectiveTotal = computed(() => {
  const pointsDiscount = (useLoyaltyPoints.value && calculatedPointsUsed.value > 0) ? calculatedPointsUsed.value * 1000 : 0;
  return Math.max(0, cartStore.totalAmount - pointsDiscount);
});

const cartStore = useCartStore();
const orderStore = useOrderStore();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const addressStore = useAddressStore();
const addressFormOpen = ref(false);
const useManualAddress = ref(false);
const saveNewAddress = ref(false);

const submitting = ref(false);
const submittedOrder = ref(null);
const proofUploaded = ref(false);

const couponCodeInput = ref('');
const validatingCoupon = ref(false);

const form = reactive({
  customer_name: authStore.user?.full_name || '',
  customer_phone: authStore.user?.phone || '',
  customer_email: authStore.user?.email || '',
  delivery_address: '',
  delivery_ward: '',
  delivery_district: '',
  delivery_province: 'Hà Nội',
  delivery_note: '',
  delivery_time_type: 'now',
  scheduled_delivery_time: '',
  payment_method: 'banking',
});

onMounted(async () => {
  settingsStore.fetchSettings();
  if (authStore.user) {
    if (authStore.user.fullName) form.customer_name = authStore.user.fullName;
    if (authStore.user.phone) form.customer_phone = authStore.user.phone;
    await addressStore.fetchAddresses().catch(() => {});
    const selected = addressStore.selectedAddress;
    if (selected) applySavedAddress(selected);
    api.get('/me/loyalty').then((res) => {
      userLoyalty.value = res.data?.data || null;
    }).catch(() => {});
  }
});

function applySavedAddress(address) {
  form.customer_name = address.receiverName;
  form.customer_phone = address.receiverPhone;
  form.delivery_address = address.detailAddress;
  form.delivery_ward = address.ward;
  form.delivery_district = address.district;
  form.delivery_province = address.province;
}

function selectSavedAddress(id) {
  addressStore.selectAddress(id);
  if (addressStore.selectedAddress) applySavedAddress(addressStore.selectedAddress);
}

async function setCheckoutDefault(id) {
  try {
    await addressStore.setDefaultAddress(id);
  } catch {}
}

async function createCheckoutAddress(data) {
  try {
    const address = await addressStore.createAddress(data);
    applySavedAddress(address);
    addressFormOpen.value = false;
    useManualAddress.value = false;
    toast.success('Đã lưu và chọn địa chỉ mới.');
  } catch {}
}

async function handleApplyCoupon() {
  const code = couponCodeInput.value.trim().toUpperCase();
  if (!code) {
    toast.error('Vui lòng nhập mã giảm giá!');
    return;
  }
  if (cartStore.subtotal === 0) {
    toast.error('Giỏ hàng chưa có món ăn!');
    return;
  }

  validatingCoupon.value = true;
  try {
    const res = await api.post('/coupons/validate', {
      code,
      subtotal: cartStore.subtotal,
    });

    if (res.data) {
      cartStore.applyCoupon(res.data);
      couponCodeInput.value = '';
      toast.success(`Đã áp dụng mã "${code}" thành công!`);
    }
  } catch (err) {
    toast.error(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
  } finally {
    validatingCoupon.value = false;
  }
}

function quickApplyCoupon(code) {
  couponCodeInput.value = code;
  handleApplyCoupon();
}

function confirmClearCart() {
  if (window.confirm('Bạn có chắc muốn xóa toàn bộ món trong giỏ hàng không?')) {
    cartStore.clearCart();
  }
}

function handleRemoveCoupon() {
  cartStore.removeCoupon();
  toast.info('Đã hủy áp dụng mã giảm giá');
}

function copyText(text, label) {
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => {
    toast.success(`Đã sao chép ${label}!`);
  }).catch(() => {
    toast.info(`${label}: ${text}`);
  });
}

async function handleSubmitOrder() {
  const selected = !useManualAddress.value ? addressStore.selectedAddress : null;
  if (!selected) {
    if (!form.customer_name.trim()) { toast.error('Vui lòng nhập họ tên người nhận!'); return; }
    if (!form.customer_phone.trim()) { toast.error('Vui lòng nhập số điện thoại người nhận!'); return; }
    if (!form.delivery_address.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng cụ thể!'); return; }
  }
  if (cartStore.items.length === 0) { toast.error('Giỏ hàng đang trống!'); return; }

  submitting.value = true;
  try {
    let scheduledTime = null;
    if (form.delivery_time_type === 'scheduled' && form.scheduled_delivery_time) {
      const [h, m] = form.scheduled_delivery_time.split(':').map(Number);
      const dt = new Date();
      dt.setHours(h, m, 0, 0);
      scheduledTime = dt.toISOString();
    }

    const payload = {
      customer_name: selected?.receiverName || form.customer_name.trim(),
      customer_phone: selected?.receiverPhone || form.customer_phone.trim(),
      customer_email: form.customer_email ? form.customer_email.trim() : null,
      delivery_address: selected?.detailAddress || form.delivery_address.trim(),
      delivery_ward: selected?.ward || '',
      delivery_district: selected?.district || '',
      delivery_province: selected?.province || 'Hà Nội',
      delivery_note: form.delivery_note.trim(),
      delivery_time_type: form.delivery_time_type,
      scheduled_delivery_time: scheduledTime,
      payment_method: form.payment_method,
      coupon_code: cartStore.coupon ? cartStore.coupon.code : null,
      use_points: useLoyaltyPoints.value ? calculatedPointsUsed.value : 0,
      shipping_address_id: selected?.id ?? null,
      items: cartStore.items.map((it) => ({ product_id: it.id, quantity: it.quantity, note: it.note })),
    };

    const created = await orderStore.createOrder(payload);
    submittedOrder.value = created;
    if (created?.tracking_token) localStorage.setItem(`tracking_${created.order_code}`, created.tracking_token);
    if (authStore.isAuthenticated && saveNewAddress.value && !selected) {
      const result = validateAddressInput({ receiver_name: payload.customer_name, receiver_phone: payload.customer_phone, province: payload.delivery_province, district: payload.delivery_district, ward: payload.delivery_ward, detail_address: payload.delivery_address });
      if (result.isValid) await addressStore.createAddress(result.data).catch(() => {});
    }
    toast.success('Đơn hàng đã được gửi thành công tới Bếp Út Hân!');
  } catch (err) {
    toast.error(err.message || 'Không thể gửi đơn hàng');
  } finally {
    submitting.value = false;
  }
}

async function handleProofUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await api.post('/uploads/payment-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    const proofUrl = uploadRes.data.url;
    await orderStore.uploadProof(submittedOrder.value.order_code, proofUrl, 'Khách gửi ảnh hóa đơn CK');
    proofUploaded.value = true;
    toast.success('Tải ảnh biên lai thành công! Quán đang kiểm tra.');
  } catch (err) {
    toast.error('Tải ảnh thất bại, vui lòng gửi qua Zalo cho quán.');
  }
}
</script>
