const runtimeEnv = import.meta.env || {};

function getActiveBackend() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On local machine dev, use local port 5000
    if (host === 'localhost' || host === '127.0.0.1') {
      return runtimeEnv.VITE_BACKEND_URL || 'http://localhost:5000';
    }
    // On any hosted domain (e.g. cuonuthan.pages.dev), NEVER allow localhost
    if (runtimeEnv.VITE_BACKEND_URL && !runtimeEnv.VITE_BACKEND_URL.includes('localhost')) {
      return runtimeEnv.VITE_BACKEND_URL;
    }
    return 'https://cuonuthan.vercel.app';
  }
  return 'https://cuonuthan.vercel.app';
}

function getActiveApiUrl() {
  const backend = getActiveBackend();
  return `${backend}/api/v1`;
}

export const appConfig = {
  get apiBaseUrl() {
    return getActiveApiUrl();
  },
  get socketUrl() {
    return getActiveBackend();
  },
  get uploadUrl() {
    return `${getActiveBackend()}/uploads`;
  },
  get backendUrl() {
    return getActiveBackend();
  },

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
