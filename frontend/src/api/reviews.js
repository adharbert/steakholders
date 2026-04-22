import { apiFetch } from './client';

export const getReviews       = (params) => apiFetch(`/api/reviews?${new URLSearchParams(params ?? {})}`);
export const createOrder      = (meatupId, data) => apiFetch(`/api/meatups/${meatupId}/orders`, { method: 'POST', body: JSON.stringify(data) });
export const submitReview     = (orderId, data)  => apiFetch(`/api/orders/${orderId}/review`,   { method: 'POST', body: JSON.stringify(data) });
export const getMyStats       = () => apiFetch('/api/users/me/stats');
export const getPendingReviews = () => apiFetch('/api/users/me/pending-reviews');
