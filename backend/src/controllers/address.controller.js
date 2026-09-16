import { sendSuccess, sendError } from '../utils/response.js';
import { validateAddress } from '../utils/addressValidation.js';
import * as addressService from '../services/address.service.js';

async function handle(res, fn) {
  try {
    const result = await fn();
    return sendSuccess(res, result);
  } catch (error) {
    if (error.statusCode) return sendError(res, error.message, [], error.statusCode);
    throw error;
  }
}

export async function listMyAddresses(req, res, next) {
  try {
    const addresses = await addressService.listAddresses(req.user.userId);
    return sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
}

export async function createMyAddress(req, res, next) {
  const validation = validateAddress(req.body);
  if (!validation.valid) return sendError(res, 'Dữ liệu địa chỉ không hợp lệ', validation.errors, 400);
  await handle(res, () => addressService.createAddress(req.user.userId, validation.data)).catch(next);
}

export async function updateMyAddress(req, res, next) {
  const validation = validateAddress(req.body, { partial: true });
  if (!validation.valid) return sendError(res, 'Dữ liệu cập nhật không hợp lệ', validation.errors, 400);
  await handle(res, () => addressService.updateAddress(req.user.userId, req.params.id, validation.data)).catch(next);
}

export async function setDefaultMyAddress(req, res, next) {
  await handle(res, () => addressService.setDefaultAddress(req.user.userId, req.params.id)).catch(next);
}

export async function deleteMyAddress(req, res, next) {
  await handle(res, () => addressService.deleteAddress(req.user.userId, req.params.id)).catch(next);
}
