import { Router } from 'express';
import { login, register, getMe, forgotPassword, verifyOtp, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { rateLimit } from '../utils/security.js';

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const router = Router();

router.post('/login', authLimit, login);
router.post('/admin-login', authLimit, login); // Alias tiện lợi cho admin
router.post('/register', authLimit, register);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, authLimit, changePassword);

// OTP & Password Reset
router.post('/forgot-password', otpLimit, forgotPassword);
router.post('/verify-otp', otpLimit, verifyOtp);
router.post('/reset-password', authLimit, resetPassword);

export default router;


