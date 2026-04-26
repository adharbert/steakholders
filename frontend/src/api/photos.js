const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function uploadPhoto(reviewId, file) {
  const token = localStorage.getItem('token');
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/api/reviews/${reviewId}/photos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Upload failed'), { status: res.status });
  }
  return res.json();
}

export async function deletePhoto(photoId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/api/photos/${photoId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('Delete failed');
  return null;
}
