import { Router } from 'express';

const router = Router();

// Render Admin Login
router.get('/login', (req, res) => {
  res.render('admin/login', {
    pageTitle: 'Đăng Nhập Quản Trị • Út Hân Cuốn',
  });
});

// Render Main Admin SPA
router.get('/', (req, res) => {
  res.render('admin/index', {
    pageTitle: 'Cổng Quản Trị & Điều Phối Bếp • Út Hân Cuốn',
  });
});

// Catch-all for admin subroutes
router.get('/*', (req, res) => {
  res.render('admin/index', {
    pageTitle: 'Cổng Quản Trị & Điều Phối Bếp • Út Hân Cuốn',
  });
});

export default router;
