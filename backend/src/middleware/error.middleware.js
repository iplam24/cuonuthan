import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ nội bộ!';
  const errors = err.errors || [];
  return sendError(res, message, errors, statusCode);
}
