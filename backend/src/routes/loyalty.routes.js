import { Router } from 'express';
import { getMyLoyalty } from '../controllers/loyalty.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getMyLoyalty);

export default router;
