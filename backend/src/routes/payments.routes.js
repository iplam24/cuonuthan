import { Router } from 'express';
import { getVietQrInfo, uploadPaymentProof, confirmPayment } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStaffOrAdmin } from '../middleware/admin.middleware.js';
import { rateLimit } from '../utils/security.js';

const paymentLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });

const router = Router();

router.get('/vietqr/:orderIdentifier', getVietQrInfo);
router.post('/upload-proof', paymentLimit, uploadPaymentProof);
router.post('/admin/:order_id/confirm', requireAuth, requireStaffOrAdmin, confirmPayment);

export default router;
