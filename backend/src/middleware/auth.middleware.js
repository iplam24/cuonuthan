import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

function getBearerToken(req) {
  const header = req.headers.authorization;
  return header && header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

export function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return sendError(res, 'Vui lòng đăng nhập để thực hiện thao tác này!', [], 401);
  const decoded = verifyToken(token);
  if (!decoded) return sendError(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ!', [], 401);
  req.user = decoded;
  next();
}

export function optionalAuth(req, res, next) {
  const token = getBearerToken(req);
  if (token) {
    const decoded = verifyToken(token);
    if (!decoded) return sendError(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ!', [], 401);
    req.user = decoded;
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return sendError(res, 'Bạn không có quyền truy cập trang quản trị!', [], 403);
  next();
}
