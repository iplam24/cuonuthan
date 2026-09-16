export function sendSuccess(res, data = {}, message = 'Thành công', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

export function sendError(res, message = 'Có lỗi xảy ra', errors = [], statusCode = 400) {
  // Backward-compatible overload: sendError(res, message, statusCode).
  if (typeof errors === 'number') {
    statusCode = errors;
    errors = [];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
}
