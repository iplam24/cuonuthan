import { io } from 'socket.io-client';
import { appConfig } from '../config/app.config.js';
import { useAuthStore } from '../stores/authStore.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket) return this.socket;

    const authStore = useAuthStore();
    this.socket = io(appConfig.socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: { token: authStore.token || undefined },
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[Socket.IO] Đã kết nối thành công tới máy chủ realtime!');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[Socket.IO] Mất kết nối tới máy chủ.');
    });

    return this.socket;
  }

  joinAdmin() {
    if (!this.socket) this.connect();
    this.socket.emit('join:admin');
  }

  joinOrder(orderCode, credentials = {}) {
    if (!this.socket) this.connect();
    this.socket.emit('join:order', orderCode, credentials);
  }

  leaveOrder(orderCode) {
    if (this.socket && orderCode) this.socket.emit('leave:order', orderCode);
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export const socketService = new SocketService();
