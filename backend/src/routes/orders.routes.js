import { Router } from 'express';
import { createOrder, getOrderTracking, getMyOrders, cancelMyOrder } from '../controllers/order.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { rateLimit } from '../utils/security.js';

const trackingLimit = rateLimit({ windowMs: 60 * 1000, max: 30 });

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/tracking/:orderCode', optionalAuth, trackingLimit, getOrderTracking);
router.get('/my-orders', requireAuth, getMyOrders);
router.post('/:id/cancel', requireAuth, cancelMyOrder);

export default router;
