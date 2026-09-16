import { Router } from 'express';
import { getProducts, getProductDetail, createProduct, updateProduct, toggleStock, updateProductStock, deleteProduct } from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStaffOrAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:idOrSlug', getProductDetail);

router.post('/admin', requireAuth, requireStaffOrAdmin, createProduct);
router.put('/admin/:id', requireAuth, requireStaffOrAdmin, updateProduct);
router.patch('/admin/:id/toggle-stock', requireAuth, requireStaffOrAdmin, toggleStock);
router.patch('/admin/:id/stock', requireAuth, requireStaffOrAdmin, updateProductStock);
router.delete('/admin/:id', requireAuth, requireStaffOrAdmin, deleteProduct);

export default router;

