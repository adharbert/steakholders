import { apiFetch } from './client';

export const register    = (data) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login       = (data) => apiFetch('/api/auth/login',    { method: 'POST', body: JSON.stringify(data) });
export const oauthLogin  = (data) => apiFetch('/api/auth/oauth',    { method: 'POST', body: JSON.stringify(data) });
export const getMe       = ()     => apiFetch('/api/auth/me');
