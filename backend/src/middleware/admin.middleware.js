import { sendError } from '../utils/response.js';

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return sendError(res, 'Chưa xác thực danh tính!', [], 401);
  }
  if (req.user.role !== 'admin') {
    return sendError(res, 'Truy cập bị từ chối! Thao tác này chỉ dành cho Quản trị viên.', [], 403);
  }
  next();
}

export function requireStaffOrAdmin(req, res, next) {
  if (!req.user) {
    return sendError(res, 'Chưa xác thực danh tính!', [], 401);
  }
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return sendError(res, 'Bạn không có quyền thực hiện thao tác quản lý này!', [], 403);
  }
  next();
}
