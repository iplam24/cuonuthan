import { defineStore } from 'pinia';
import { adminService } from '../services/admin.service.js';
import { paymentService } from '../services/payment.service.js';
import { socketService } from '../services/socket.service.js';
import { soundManager } from '../utils/sound.js';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    stats: null,
    orders: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    selectedOrder: null,
    shippers: [],
    newOrdersCount: 0,
    soundEnabled: true,
    socketConnected: false,
    loading: false,
    error: null,
  }),

  actions: {
    initRealtime() {
      const socket = socketService.connect();
      socketService.joinAdmin();

      this.socketConnected = socketService.connected;

      socketService.on('connect', () => {
        this.socketConnected = true;
        socketService.joinAdmin();
      });

      socketService.on('disconnect', () => {
        this.socketConnected = false;
      });

      // Listen for new order
      socketService.on('order:created', (newOrder) => {
        this.newOrdersCount++;
        if (this.soundEnabled) {
          soundManager.playOrderBell();
        }

        // Add to orders list if on first page
        if (this.orders.length > 0) {
          this.orders.unshift(newOrder);
        }

        // Update stats if present
        if (this.stats && this.stats.today) {
          this.stats.today.orders++;
          this.stats.today.revenue += Number(newOrder.total_amount);
          if (this.stats.status_counts) {
            this.stats.status_counts.pending = (this.stats.status_counts.pending || 0) + 1;
          }
        }
      });

      // Listen for payment proof uploaded
      socketService.on('payment:proof_uploaded', (proofData) => {
        if (this.soundEnabled) {
          soundManager.playOrderBell();
        }
      });
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      soundManager.muted = !this.soundEnabled;
      return this.soundEnabled;
    },

    clearNewOrdersBadge() {
      this.newOrdersCount = 0;
    },

    async fetchDashboard() {
      this.loading = true;
      try {
        const response = await adminService.getDashboardStats();
        this.stats = response.data;
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders(params = {}) {
      this.loading = true;
      try {
        const response = await adminService.getOrders(params);
        this.orders = response.data.items || [];
        this.pagination = response.data.pagination || this.pagination;
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderDetails(id) {
      try {
        const response = await adminService.getOrderById(id);
        this.selectedOrder = response.data;
        return response.data;
      } catch (err) {
        throw err;
      }
    },

    async updateStatus(id, status, note = '') {
      try {
        const res = await adminService.updateOrderStatus(id, status, note);
        // update local state
        const ord = this.orders.find((o) => o.id === Number(id));
        if (ord) {
          ord.status = status;
        }
        if (this.selectedOrder && this.selectedOrder.id === Number(id)) {
          this.selectedOrder.status = status;
          if (!this.selectedOrder.history) this.selectedOrder.history = [];
          this.selectedOrder.history.push({
            status,
            note: note || `Cập nhật sang ${status}`,
            created_at: new Date().toISOString(),
          });
        }
        return res;
      } catch (err) {
        throw err;
      }
    },

    async assignShipper(id, shipper_id) {
      try {
        const res = await adminService.assignShipper(id, shipper_id);
        const ord = this.orders.find((o) => o.id === Number(id));
        if (ord) ord.shipper_id = shipper_id;
        if (this.selectedOrder && this.selectedOrder.id === Number(id)) {
          this.selectedOrder.shipper_id = shipper_id;
        }
        return res;
      } catch (err) {
        throw err;
      }
    },

    async addNote(id, note) {
      try {
        const res = await adminService.addAdminNote(id, note);
        if (this.selectedOrder && this.selectedOrder.id === Number(id)) {
          if (!this.selectedOrder.admin_notes) this.selectedOrder.admin_notes = [];
          this.selectedOrder.admin_notes.unshift(res.data);
        }
        return res;
      } catch (err) {
        throw err;
      }
    },

    async confirmPayment(orderId, status = 'paid', notes = '') {
      try {
        const res = await paymentService.confirmPayment(orderId, { status, notes });
        const ord = this.orders.find((o) => o.id === Number(orderId));
        if (ord) ord.payment_status = status;
        if (this.selectedOrder && this.selectedOrder.id === Number(orderId)) {
          this.selectedOrder.payment_status = status;
        }
        return res;
      } catch (err) {
        throw err;
      }
    },

    async fetchShippers() {
      try {
        const res = await adminService.getShippers();
        this.shippers = res.data || [];
        return this.shippers;
      } catch (err) {
        console.error('Lỗi tải danh sách shipper:', err);
      }
    },
  },
});
