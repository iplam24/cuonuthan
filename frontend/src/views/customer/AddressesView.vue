<template>
  <main class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/70">
      <div>
        <div class="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600">
          <span class="h-2 w-2 rounded-full bg-rose-500"></span>
          <span>Tài khoản & Sổ địa chỉ</span>
        </div>
        <h1 class="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">Sổ Địa Chỉ Nhận Hàng</h1>
        <p class="mt-1 text-xs text-slate-500">Lưu tối đa 20 địa chỉ để đặt món cuốn nhanh hơn mỗi lần gọi món.</p>
      </div>
      <AppButton @click="openForm()">+ Thêm địa chỉ mới</AppButton>
    </div>

    <p v-if="store.error" class="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700" role="alert">{{ store.error }}</p>

    <div v-if="store.loading" class="grid gap-4 sm:grid-cols-2">
      <div v-for="i in 4" :key="i" class="h-48 animate-pulse rounded-2xl bg-white border border-slate-100 shadow-xs"></div>
    </div>

    <SurfaceCard v-else-if="!store.addresses.length" className="p-12 text-center shadow-soft">
      <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 mx-auto">
        <MapPin class="h-8 w-8" />
      </div>
      <h2 class="mt-4 text-base font-bold text-slate-900">Chưa có địa chỉ nào được lưu</h2>
      <p class="mt-1 text-xs text-slate-500 max-w-sm mx-auto">Thêm địa chỉ giao hàng thường dùng để đặt món cuốn nhanh chóng chỉ với 1 chạm.</p>
      <AppButton class="mt-5" @click="openForm()">Thêm địa chỉ đầu tiên</AppButton>
    </SurfaceCard>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <AddressCard v-for="address in store.addresses" :key="address.id" :address="address" :pending="store.pending" @edit="openForm" @default="setDefault" @delete="deleteTarget = $event" />
    </div>

    <div v-if="formOpen" class="fixed inset-0 z-50 flex items-end bg-slate-950/60 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4" @click.self="closeForm" @keydown.esc="closeForm">
      <SurfaceCard ref="formDialog" className="max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:max-w-2xl sm:rounded-3xl sm:p-8 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="address-dialog-title" tabindex="-1">
        <h2 id="address-dialog-title" class="mb-5 text-xl font-extrabold text-slate-900 tracking-tight">{{ editing ? 'Sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng' }}</h2>
        <AddressForm :address="editing" :loading="Boolean(store.pending)" @cancel="closeForm" @submit="save" />
      </SurfaceCard>
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4" @click.self="deleteTarget = null" @keydown.esc="deleteTarget = null">
      <SurfaceCard className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="delete-address-title" aria-describedby="delete-address-description">
        <h2 id="delete-address-title" class="text-lg font-extrabold text-slate-900">Xóa địa chỉ này?</h2>
        <p id="delete-address-description" class="mt-2 text-xs text-slate-500 leading-relaxed">{{ deleteTarget.formattedAddress }}. Thao tác này không thể hoàn tác.</p>
        <div class="mt-6 flex justify-end gap-2.5">
          <AppButton variant="outline" @click="deleteTarget = null">Hủy</AppButton>
          <AppButton variant="danger" :loading="store.pending === `delete:${deleteTarget.id}`" @click="remove">Xóa địa chỉ</AppButton>
        </div>
      </SurfaceCard>
    </div>
  </main>
</template>
<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { MapPin } from 'lucide-vue-next';
import { useAddressStore } from '../../stores/addressStore.js';
import { toast } from '../../utils/toast.js';
import AppButton from '../../components/common/AppButton.vue';
import SurfaceCard from '../../components/common/SurfaceCard.vue';
import AddressCard from '../../components/address/AddressCard.vue';
import AddressForm from '../../components/address/AddressForm.vue';
const store = useAddressStore(); const formOpen = ref(false); const editing = ref(null); const deleteTarget = ref(null); const formDialog = ref(null);
onMounted(() => store.fetchAddresses().catch(() => {}));
async function openForm(address = null) { editing.value = address; formOpen.value = true; await nextTick(); formDialog.value?.$el?.focus?.(); }
function closeForm() { if (!store.pending) { formOpen.value = false; editing.value = null; } }
async function save(data) { try { if (editing.value) await store.updateAddress(editing.value.id, data); else await store.createAddress(data); toast.success('Đã lưu địa chỉ.'); closeForm(); } catch {} }
async function setDefault(id) { try { await store.setDefaultAddress(id); toast.success('Đã đặt làm địa chỉ mặc định.'); } catch {} }
async function remove() { try { await store.deleteAddress(deleteTarget.value.id); deleteTarget.value = null; toast.success('Đã xóa địa chỉ.'); } catch {} }
</script>
