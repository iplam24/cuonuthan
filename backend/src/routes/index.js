import { Router } from 'express';
import authRoutes from './auth.routes.js';
import settingsRoutes from './settings.routes.js';
import categoryRoutes from './categories.routes.js';
import productRoutes from './products.routes.js';
import orderRoutes from './orders.routes.js';
import paymentRoutes from './payments.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './uploads.routes.js';
import couponRoutes from './coupons.routes.js';
import addressRoutes from './addresses.routes.js';
import reviewRoutes from './reviews.routes.js';
import loyaltyRoutes from './loyalty.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/uploads', uploadRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/me/addresses', addressRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/me/loyalty', loyaltyRoutes);

export default apiRouter;
