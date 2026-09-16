import api from './api.js';

export const addressService = {
  list() { return api.get('/me/addresses'); },
  create(data) { return api.post('/me/addresses', data); },
  update(id, data) { return api.patch(`/me/addresses/${id}`, data); },
  setDefault(id) { return api.put(`/me/addresses/${id}/default`); },
  remove(id) { return api.delete(`/me/addresses/${id}`); },
};

export function unwrapAddressResponse(response) {
  return response?.data ?? response;
}
