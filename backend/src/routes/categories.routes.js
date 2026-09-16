import { Router } from 'express';
import { getCategories, getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStaffOrAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', getCategories);
router.get('/admin/all', requireAuth, requireStaffOrAdmin, getAllCategoriesAdmin);
router.post('/admin', requireAuth, requireStaffOrAdmin, createCategory);
router.put('/admin/:id', requireAuth, requireStaffOrAdmin, updateCategory);
router.delete('/admin/:id', requireAuth, requireStaffOrAdmin, deleteCategory);

export default router;
