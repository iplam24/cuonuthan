import { defineStore } from 'pinia';
import { useSettingsStore } from './settingsStore.js';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('uthan_cart') || '[]'),
    coupon: null,
    isDrawerOpen: false,
  }),

  getters: {
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),

    subtotal: (state) => state.items.reduce((total, item) => total + item.price * item.quantity, 0),

    shippingFee(state) {
      const settingsStore = useSettingsStore();
      if (this.subtotal === 0) return 0;
      if (this.subtotal >= settingsStore.freeShippingThreshold) return 0;
      return settingsStore.shippingFee;
    },

    discountAmount(state) {
      if (!state.coupon) return 0;
      const c = state.coupon;
      if (c.discount_amount) return c.discount_amount;
      if (c.discount_type === 'percentage' || c.discount_type === 'percent') {
        const val = (this.subtotal * Number(c.discount_value)) / 100;
        return c.max_discount ? Math.min(val, Number(c.max_discount)) : val;
      }
      return Math.min(Number(c.discount_value || 0), this.subtotal);
    },

    totalAmount(state) {
      return Math.max(0, this.subtotal + this.shippingFee - this.discountAmount);
    },

    hasMainDish: (state) => state.items.some((item) => !item.is_side_dish),
    mainDishesCount: (state) => state.items.filter((item) => !item.is_side_dish).reduce((sum, i) => sum + i.quantity, 0),
    sideDishesCount: (state) => state.items.filter((item) => item.is_side_dish).reduce((sum, i) => sum + i.quantity, 0),

    isDepositRequired(state) {
      const settingsStore = useSettingsStore();
      return this.totalAmount >= settingsStore.depositThreshold;
    },

    depositAmount(state) {
      const settingsStore = useSettingsStore();
      if (!this.isDepositRequired) return 0;
      return Math.min(settingsStore.depositAmount, this.totalAmount);
    },
  },

  actions: {
    saveToStorage() {
      localStorage.setItem('uthan_cart', JSON.stringify(this.items));
    },

    addItem(product, quantity = 1, note = '') {
      if (product.is_out_of_stock) {
        throw new Error(`Món "${product.name}" hiện đang hết hàng!`);
      }

      // Business Rule: Khách chỉ được đặt món phụ/đồ uống khi đã chọn món chính
      if (product.is_side_dish && !this.hasMainDish) {
        throw new Error('Quán chỉ nhận giao kèm món phụ / đồ uống khi có ít nhất 1 món chính trong giỏ hàng! Vui lòng chọn món cuốn hoặc món chính trước nhé.');
      }

      const existingIndex = this.items.findIndex((i) => i.id === product.id);
      if (existingIndex > -1) {
        this.items[existingIndex].quantity += quantity;
        if (note) {
          this.items[existingIndex].note = note;
        }
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          primary_image: product.primary_image,
          unit: product.unit || 'phần',
          quantity: Math.max(1, quantity),
          note: note || '',
          is_side_dish: product.is_side_dish ? 1 : 0,
        });
      }
      this.saveToStorage();
    },

    updateQuantity(productId, quantity) {
      const qty = parseInt(quantity, 10);
      if (qty <= 0) {
        this.removeItem(productId);
        return;
      }
      const item = this.items.find((i) => i.id === productId);
      if (item) {
        item.quantity = qty;
        this.saveToStorage();
      }
    },

    updateNote(productId, note) {
      const item = this.items.find((i) => i.id === productId);
      if (item) {
        item.note = note;
        this.saveToStorage();
      }
    },

    removeItem(productId) {
      this.items = this.items.filter((i) => i.id !== productId);
      this.saveToStorage();
    },

    clearCart() {
      this.items = [];
      this.coupon = null;
      this.saveToStorage();
    },

    applyCoupon(couponData) {
      this.coupon = couponData;
    },

    removeCoupon() {
      this.coupon = null;
    },

    toggleDrawer(open) {
      this.isDrawerOpen = open !== undefined ? open : !this.isDrawerOpen;
    },
  },
});
