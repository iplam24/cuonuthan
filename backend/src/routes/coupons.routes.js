import { Router } from 'express';
import {
  validateCoupon,
  getActiveCoupons,
  getAllCouponsAdmin,
  createCoupon,
  toggleCouponStatus,
} from '../controllers/coupon.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public endpoints
router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);

// Admin endpoints
router.get('/', requireAuth, requireAdmin, getAllCouponsAdmin);
router.post('/', requireAuth, requireAdmin, createCoupon);
router.patch('/:id/toggle', requireAuth, requireAdmin, toggleCouponStatus);

export default router;
