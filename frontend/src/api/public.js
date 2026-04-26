const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function publicFetch(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Request failed'), { status: res.status });
  }
  return res.json();
}

export const getPublicRestaurants = () => publicFetch('/api/public/restaurants');
export const getPublicRestaurant  = (name) => publicFetch(`/api/public/restaurants/${encodeURIComponent(name)}`);
export const getPublicReviews     = (limit = 10) => publicFetch(`/api/public/reviews?limit=${limit}`);

export async function generateRestaurantSummary(name) {
  const res = await fetch(`${BASE}/api/public/restaurants/${encodeURIComponent(name)}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Summary generation failed'), { status: res.status });
  }
  return res.json();
}
