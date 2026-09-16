import { Router } from 'express';
import { handleSingleUpload, handleMultipleUpload } from '../controllers/upload.controller.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStaffOrAdmin } from '../middleware/admin.middleware.js';
import { rateLimit } from '../utils/security.js';

const router = Router();
const uploadLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });

// Product/media uploads are staff-only. Guest payment proofs use /payment-proof.
router.post('/single', uploadLimit, requireAuth, requireStaffOrAdmin, uploadSingle, handleSingleUpload);
router.post('/multiple', uploadLimit, requireAuth, requireStaffOrAdmin, uploadMultiple, handleMultipleUpload);
router.post('/payment-proof', uploadLimit, uploadSingle, handleSingleUpload);

export default router;
