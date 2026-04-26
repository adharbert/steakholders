import { apiFetch } from './client';

export const getMyGroups     = ()          => apiFetch('/api/groups/my');
export const getGroup        = (id)        => apiFetch(`/api/groups/${id}`);
export const createGroup     = (data)      => apiFetch('/api/groups', { method: 'POST', body: JSON.stringify(data) });
export const searchGroups    = (zip)       => apiFetch(`/api/groups/search?zip=${encodeURIComponent(zip)}`);
export const joinGroup       = (id, code)  => apiFetch(`/api/groups/${id}/join`, { method: 'POST', body: JSON.stringify({ inviteCode: code ?? null }) });
export const getGroupMembers = (id)        => apiFetch(`/api/groups/${id}/members`);
export const approveMember   = (id, uid)   => apiFetch(`/api/groups/${id}/members/${uid}`, { method: 'PUT', body: JSON.stringify({ status: 'active' }) });
export const rejectMember    = (id, uid)   => apiFetch(`/api/groups/${id}/members/${uid}`, { method: 'PUT', body: JSON.stringify({ status: 'rejected' }) });
export const removeMember    = (id, uid)   => apiFetch(`/api/groups/${id}/members/${uid}`, { method: 'DELETE' });
