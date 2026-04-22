import { apiFetch } from './client';

export const getMeatups   = (params) => apiFetch(`/api/meatups?${new URLSearchParams(params ?? {})}`);
export const getMeatup    = (id)     => apiFetch(`/api/meatups/${id}`);
export const createMeatup = (data)   => apiFetch('/api/meatups', { method: 'POST', body: JSON.stringify(data) });
export const updateMeatup = (id, d)  => apiFetch(`/api/meatups/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteMeatup = (id)     => apiFetch(`/api/meatups/${id}`, { method: 'DELETE' });
export const rsvp         = (id, status) => apiFetch(`/api/meatups/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) });
export const removeRsvp   = (id)     => apiFetch(`/api/meatups/${id}/rsvp`, { method: 'DELETE' });
export const getAttendees = (id)     => apiFetch(`/api/meatups/${id}/attendees`);
