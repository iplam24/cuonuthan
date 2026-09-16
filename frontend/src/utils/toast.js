import { ref } from 'vue';

export const toasts = ref([]);

export function showToast(message, type = 'success', duration = 3500) {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
}

export const toast = {
  success: (msg, duration) => showToast(msg, 'success', duration),
  error: (msg, duration) => showToast(msg, 'error', duration),
  info: (msg, duration) => showToast(msg, 'info', duration),
  warning: (msg, duration) => showToast(msg, 'warning', duration),
};
