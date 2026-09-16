import { defineStore } from 'pinia';
import { settingsService } from '../services/settings.service.js';
import { appConfig } from '../config/app.config.js';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      brand_name: appConfig.defaultAppName,
      brand_slogan: appConfig.defaultSlogan,
      hotline: appConfig.defaultHotline,
      zalo: appConfig.defaultZalo,
      facebook: appConfig.defaultFacebook,
      store_address: appConfig.defaultAddress,
      store_status: appConfig.defaultStoreStatus,
      delivery_time: appConfig.defaultDeliveryTime,
      default_shipping_fee: appConfig.defaultShippingFee,
      free_shipping_threshold: appConfig.freeShippingThreshold,
      deposit_threshold: appConfig.defaultDepositThreshold,
      deposit_amount: appConfig.defaultDepositAmount,
      bank_id: 'MB',
      bank_account_no: '0988888888',
      bank_account_name: 'NGUYEN THI HAN',
    },
    loaded: false,
    loading: false,
  }),

  getters: {
    brandName: (state) => state.settings.brand_name || appConfig.defaultAppName,
    brandSlogan: (state) => state.settings.brand_slogan || appConfig.defaultSlogan,
    hotline: (state) => state.settings.hotline || appConfig.defaultHotline,
    zalo: (state) => {
      const value = state.settings.zalo ?? state.settings.zalo_url;
      if (!value) return appConfig.defaultZalo;
      const match = String(value).trim().match(/^https?:\/\/(?:www\.)?zalo\.me\/([^/?#]+)/i);
      return match ? match[1] : String(value).trim();
    },
    zaloUrl: (state) => {
      const id = state.settings.zalo ?? state.settings.zalo_url ?? appConfig.defaultZalo;
      const cleanId = String(id).trim().replace(/^https?:\/\/(?:www\.)?zalo\.me\//i, '');
      return `https://zalo.me/${cleanId || appConfig.defaultZalo}`;
    },
    facebook: (state) => state.settings.facebook ?? state.settings.facebook_url ?? appConfig.defaultFacebook,
    email: (state) => state.settings.email || '',
    businessHours: (state) => state.settings.business_hours || '09:00 – 22:30',
    storeStatus: (state) => state.settings.store_status || appConfig.defaultStoreStatus,
    deliveryTime: (state) => state.settings.delivery_time || appConfig.defaultDeliveryTime,
    address: (state) => state.settings.store_address || state.settings.address || appConfig.defaultAddress,
    shippingFee: (state) => Number(state.settings.default_shipping_fee) || 25000,
    freeShippingThreshold: (state) => Number(state.settings.free_shipping_threshold) || 500000,
    depositThreshold: (state) => Number(state.settings.deposit_threshold) || 200000,
    depositAmount: (state) => Number(state.settings.deposit_amount) || 50000,
    bankInfo: (state) => ({
      bankId: state.settings.bank_id || 'MB',
      accountNo: state.settings.bank_account_no || '0988888888',
      accountName: state.settings.bank_account_name || 'NGUYEN THI HAN',
    }),
  },

  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const response = await settingsService.getSettings();
        if (response.data) {
          const data = { ...response.data };
          data.brand_name ??= data.app_name;
          data.brand_slogan ??= data.slogan;
          data.store_address ??= data.address;
          data.default_shipping_fee ??= data.shipping_fee;
          data.deposit_amount ??= data.default_deposit_amount;
          data.bank_account_no ??= data.bank_account_number;
          data.bank_account_name ??= data.bank_account_holder;
          data.facebook_url ??= data.facebook;
          data.zalo_url ??= data.zalo;
          this.settings = { ...this.settings, ...data };
          this.loaded = true;
        }
      } catch (err) {
        console.warn('Could not fetch settings from API, fallback to defaults:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateSettings(newSettings) {
      this.loading = true;
      try {
        await settingsService.updateSettings(newSettings);
        this.settings = { ...this.settings, ...newSettings };
      } catch (err) {
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
