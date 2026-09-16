import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', getSettings);
router.put('/admin', requireAuth, requireAdmin, updateSettings);

export default router;
