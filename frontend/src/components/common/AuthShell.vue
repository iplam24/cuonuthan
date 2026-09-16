<template>
  <div class="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-14">
    <section class="hidden flex-col justify-center gap-6 rounded-3xl bg-gradient-to-br from-white via-rose-50/20 to-amber-50/20 border border-slate-200/80 p-8 sm:p-10 shadow-soft lg:flex">
      <div class="inline-flex items-center gap-2 self-start rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-600">
        <span class="h-2 w-2 rounded-full bg-rose-500"></span>
        <span>Thành Viên Bếp Út Hân</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{{ title }}</h2>
      <p class="text-sm leading-relaxed text-slate-600">{{ subtitle }}</p>

      <ul class="space-y-4 pt-2" aria-label="Lợi ích thành viên Út Hân">
        <li v-for="(benefit, index) in benefits" :key="index" class="flex items-start gap-3.5 bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200/60 text-xs font-extrabold text-rose-600" aria-hidden="true">{{ index + 1 }}</span>
          <div>
            <p class="text-sm font-bold text-slate-900">{{ benefit.title }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ benefit.description }}</p>
          </div>
        </li>
      </ul>

      <blockquote class="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs italic text-amber-900 font-medium">
        “{{ quote }}”
      </blockquote>
    </section>

    <div class="w-full max-w-md mx-auto lg:max-w-none">
      <div class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card sm:p-10">
        <header class="mb-6 space-y-2 text-center lg:text-left">
          <h1 class="font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">{{ heading }}</h1>
          <p class="text-xs text-slate-500">{{ description }}</p>
        </header>

        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  heading: { type: String, required: true },
  description: { type: String, default: '' },
  quote: { type: String, default: 'Đặt món cuốn Việt chuẩn vị, giao tận nơi trong 30 phút.' },
  benefits: {
    type: Array,
    default: () => [
      { title: 'Lưu địa chỉ & đơn hàng', description: 'Đặt lại nhanh, không cần nhập lại thông tin mỗi lần gọi món.' },
      { title: 'Theo dõi đơn trực tuyến', description: 'Xem trạng thái bếp đang làm, shipper đang trên đường đến bạn.' },
      { title: 'Ưu đãi thành viên', description: 'Nhận mã giảm giá riêng, tích điểm và ưu tiên suất mới ra mắt.' },
    ],
  },
});
</script>
