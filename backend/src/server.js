import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';
import { getAllowedOrigins, isOriginAllowed } from './utils/security.js';
import { verifyToken } from './utils/jwt.js';
import { canAccessOrder } from './utils/orderAccess.js';
import db from './config/database.js';

const server = http.createServer(app);
const allowedOrigins = getAllowedOrigins(env.clientUrl, env.nodeEnv);

export const io = new Server(server, {
  cors: { origin: (origin, callback) => callback(null, isOriginAllowed(origin, allowedOrigins)), methods: ['GET', 'POST'] },
});
app.set('io', io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');
  socket.user = token ? verifyToken(token) : null;
  next();
});

io.on('connection', (socket) => {
  socket.on('join:admin', () => {
    if (socket.user && ['admin', 'staff'].includes(socket.user.role)) socket.join('admin_room');
    else socket.emit('error:auth', { message: 'Không có quyền truy cập phòng quản trị.' });
  });

  socket.on('join:order', async (orderCode, credentials = {}) => {
    if (!orderCode || typeof orderCode !== 'string' || orderCode.length > 64) return;
    try {
      const [orders] = await db.query('SELECT order_code, customer_phone FROM orders WHERE order_code = ? LIMIT 1', [orderCode.trim()]);
      if (orders[0] && canAccessOrder({ user: socket.user, trackingToken: credentials.trackingToken || socket.handshake.auth?.trackingToken, phone: credentials.phone, order: orders[0] })) {
        socket.join(`order_${orders[0].order_code}`);
      } else socket.emit('error:auth', { message: 'Không có quyền theo dõi đơn hàng này.' });
    } catch { socket.emit('error:server', { message: 'Không thể tham gia phòng đơn hàng.' }); }
  });

  socket.on('leave:order', (orderCode) => { if (typeof orderCode === 'string') socket.leave(`order_${orderCode}`); });
});

async function startServer() {
  try {
    const dbStatus = await testConnection();
    console.log(`[Bootstrap] Kết nối MySQL thành công! Database: ${dbStatus.data.db}`);
    server.listen(env.port, () => console.log(`[Bootstrap] Út Hân Cuốn Backend Server đang chạy tại: http://localhost:${env.port}`));
  } catch (error) { console.error('[Bootstrap] Lỗi khởi động Server hoặc kết nối Database thất bại:', error); process.exit(1); }
}
startServer();
