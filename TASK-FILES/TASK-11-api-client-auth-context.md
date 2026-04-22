---
status: complete
---

# TASK-11 · API Client & Auth Context

Wire up the frontend to the backend API with a JWT-aware fetch wrapper and a React Auth context.

## Goal

All API calls go through a single `api/` module that automatically attaches the JWT. The `AuthContext` holds the logged-in user and token, persisted in `localStorage`, and exposes `login`, `register`, and `logout` functions.

## Files to Create

### `frontend/src/api/client.js`

A thin wrapper around `fetch`:
```js
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? 'Request failed'), { status: res.status, body });
  }
  return res.status === 204 ? null : res.json();
}
```

### `frontend/src/api/auth.js`
```js
export const register = (data) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login    = (data) => apiFetch('/api/auth/login',    { method: 'POST', body: JSON.stringify(data) });
export const getMe   = ()     => apiFetch('/api/auth/me');
```

### `frontend/src/api/meatups.js`
```js
export const getMeatups    = (params) => apiFetch(`/api/meatups?${new URLSearchParams(params)}`);
export const getMeatup     = (id)     => apiFetch(`/api/meatups/${id}`);
export const createMeatup  = (data)   => apiFetch('/api/meatups', { method: 'POST', body: JSON.stringify(data) });
export const rsvp          = (id, status) => apiFetch(`/api/meatups/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) });
```

### `frontend/src/api/reviews.js`
```js
export const getReviews    = (params) => apiFetch(`/api/reviews?${new URLSearchParams(params)}`);
export const createOrder   = (meatupId, data) => apiFetch(`/api/meatups/${meatupId}/orders`, { method: 'POST', body: JSON.stringify(data) });
export const submitReview  = (orderId, data)  => apiFetch(`/api/orders/${orderId}/review`,   { method: 'POST', body: JSON.stringify(data) });
export const getMyStats    = () => apiFetch('/api/users/me/stats');
```

### `frontend/src/api/bill.js`
```js
export const getBill       = (meatupId)           => apiFetch(`/api/meatups/${meatupId}/bill`);
export const createBill    = (meatupId, data)      => apiFetch(`/api/meatups/${meatupId}/bill`, { method: 'POST', body: JSON.stringify(data) });
export const markPaid      = (meatupId, userId, paid) => apiFetch(`/api/meatups/${meatupId}/bill/payments/${userId}`, { method: 'PATCH', body: JSON.stringify({ paid }) });
```

### `frontend/src/context/AuthContext.jsx`

```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (credentials) => {
    const { token, user } = await login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const handleRegister = async (data) => {
    const { token, user } = await register(data);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Acceptance Criteria

- [ ] `apiFetch` attaches `Authorization: Bearer` header when a token is in localStorage.
- [ ] `apiFetch` throws an error with `.status` and `.body` for non-2xx responses.
- [ ] `AuthContext` restores session from localStorage on app load via `GET /api/auth/me`.
- [ ] `logout()` clears the token and user from state.
- [ ] 401 responses from any API call clear the token and redirect to `/login`.
