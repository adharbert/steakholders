import { apiFetch } from './client';

export const searchRestaurants = (params) => apiFetch(`/api/restaurants/search?${new URLSearchParams(params ?? {})}`);
export const getRestaurant     = (id)     => apiFetch(`/api/restaurants/${id}`);
export const createRestaurant  = (data)   => apiFetch('/api/restaurants', { method: 'POST', body: JSON.stringify(data) });
export const importNearby      = (zip)    => apiFetch(`/api/restaurants/import?zip=${encodeURIComponent(zip)}`, { method: 'POST' });
