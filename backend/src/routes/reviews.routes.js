import { Router } from 'express';
import {
  createOrderReview,
  getOrderReview,
  getFeaturedReviews,
  adminGetReviews,
  adminUpdateReview
} from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStaffOrAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Public / Customer routes
router.get('/featured', getFeaturedReviews);
router.get('/:orderCode', getOrderReview);
router.post('/:orderCode', createOrderReview);

// Admin routes
router.get('/admin/all', requireAuth, requireStaffOrAdmin, adminGetReviews);
router.patch('/admin/:id', requireAuth, requireStaffOrAdmin, adminUpdateReview);

export default router;
