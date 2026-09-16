import api from './api.js';

export const settingsService = {
  getSettings() {
    return api.get('/settings');
  },

  updateSettings(settings) {
    return api.put('/settings/admin', settings);
  },
};
