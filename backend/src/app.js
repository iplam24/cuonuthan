import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import apiRouter from './routes/index.js';
import adminViewRoutes from './routes/admin-view.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';
import { getAllowedOrigins, isOriginAllowed, getRequestOrigin } from './utils/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Lightweight security headers (no extra dependency).
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (env.nodeEnv === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const allowedOrigins = getAllowedOrigins(env.clientUrl, env.nodeEnv);
app.use(cors((req, callback) => {
  const origin = req.headers.origin;
  callback(null, {
    origin: isOriginAllowed(origin, allowedOrigins, getRequestOrigin(req)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình View Engine EJS cho SPA Admin - hỗ trợ đa đường dẫn serverless
const potentialViewDirs = [
  path.resolve(__dirname, '../views'),
  path.resolve(process.cwd(), 'backend/views'),
  path.resolve(process.cwd(), 'views')
];
const viewsDir = potentialViewDirs.find((dir) => fs.existsSync(dir)) || path.resolve(__dirname, '../views');

app.set('view engine', 'ejs');
app.set('views', viewsDir);

// Phục vụ ảnh upload tĩnh
const potentialUploadDirs = [
  path.resolve(__dirname, '../uploads'),
  path.resolve(process.cwd(), 'backend/uploads'),
  path.resolve(process.cwd(), 'uploads')
];
const uploadsDir = potentialUploadDirs.find((dir) => fs.existsSync(dir)) || path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Redirect trang chủ backend sang cổng Admin SPA
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Cổng giao diện Quản trị & Điều phối Admin EJS SPA
app.use('/admin', adminViewRoutes);

// Health check endpoint
app.get('/api/v1/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    return res.status(200).json({
      success: true,
      message: 'Hệ thống Bếp Út Hân Cuốn API hoạt động bình thường!',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        dbName: dbStatus.data.db
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi kết nối cơ sở dữ liệu!',
      error: error.message
    });
  }
});

// Gắn toàn bộ API routes
app.use('/api/v1', apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
