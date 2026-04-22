import { apiFetch } from './client';

export const getBill    = (meatupId)               => apiFetch(`/api/meatups/${meatupId}/bill`);
export const createBill = (meatupId, data)          => apiFetch(`/api/meatups/${meatupId}/bill`, { method: 'POST', body: JSON.stringify(data) });
export const updateBill = (meatupId, data)          => apiFetch(`/api/meatups/${meatupId}/bill`, { method: 'PUT', body: JSON.stringify(data) });
export const markPaid   = (meatupId, userId, paid)  => apiFetch(`/api/meatups/${meatupId}/bill/payments/${userId}`, { method: 'PATCH', body: JSON.stringify({ paid }) });
