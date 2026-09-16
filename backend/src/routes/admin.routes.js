import { Router } from 'express';
import { getDashboardStats, getCustomers, getShippers, createShipper, updateShipper, deleteShipper, toggleShipperStatus } from '../controllers/admin.controller.js';
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  assignShipper,
  addAdminNote,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStaffOrAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// All admin routes require auth and staff/admin role
router.use(requireAuth, requireStaffOrAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/assign-shipper', assignShipper);
router.post('/orders/:id/notes', addAdminNote);
router.get('/customers', getCustomers);
router.get('/customers/:id/orders', async (req, res, next) => {
  try {
    const db = (await import('../config/database.js')).default;
    const { sendSuccess } = await import('../utils/response.js');
    const [orders] = await db.query(
      `SELECT o.*, (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
       FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC LIMIT 50`,
      [req.params.id]
    );
    return sendSuccess(res, orders.map((order) => ({
      ...order,
      status: String(order.status || '').toLowerCase(),
      payment_status: String(order.payment_status || '').toLowerCase(),
    })));
  } catch (error) { next(error); }
});
router.get('/shippers', getShippers);
router.post('/shippers', createShipper);
router.put('/shippers/:id', updateShipper);
router.delete('/shippers/:id', deleteShipper);
router.patch('/shippers/:id/toggle', toggleShipperStatus);

export default router;
