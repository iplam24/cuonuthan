const runtimeEnv = import.meta.env || {};
const isBrowser = typeof window !== 'undefined';
const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultBackend = isLocal ? 'http://localhost:5000' : 'https://cuonuthan.vercel.app';

export const appConfig = {
  apiBaseUrl: runtimeEnv.VITE_API_BASE_URL || `${defaultBackend}/api/v1`,
  socketUrl: runtimeEnv.VITE_SOCKET_URL || defaultBackend,
  uploadUrl: runtimeEnv.VITE_UPLOAD_URL || `${defaultBackend}/uploads`,
  backendUrl: runtimeEnv.VITE_BACKEND_URL || defaultBackend,

  defaultAppName: 'Út Hân Cuốn',
  defaultSlogan: 'Bếp Ấm Út Hân - Món Cuốn Chuẩn Vị, Giao Tận Cửa',
  defaultHotline: '0988.888.888',
  defaultZalo: '0988888888',
  defaultFacebook: 'https://facebook.com/uthan.cuonviet',
  defaultAddress: '128 Đường Láng, Đống Đa, Hà Nội',
  defaultStoreStatus: 'Bếp Út Hân đang mở cửa',
  defaultDeliveryTime: '25–35 phút',

  defaultShippingFee: 25000,
  freeShippingThreshold: 500000,
  defaultDepositThreshold: 200000,
  defaultDepositAmount: 50000,

  requestTimeout: 15000,
};

export function getFullImageUrl(url) {
  if (!url) return '/food-placeholder.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${appConfig.backendUrl}${url}`;
  return `${appConfig.backendUrl}/${url}`;
}

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}
