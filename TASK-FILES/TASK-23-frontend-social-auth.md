---
status: pending
---

# TASK-23 · Frontend Social Login & Email Registration

Update the Login and Register screens to support email/password accounts and one-click Google / Facebook login. Handle the OAuth token redirect from the backend.

## Goal

Users see familiar "Sign in with Google" and "Sign in with Facebook" buttons alongside the existing username/password form. After OAuth, the backend redirects back to the frontend with a token in the URL — the app picks it up, stores it, and lands the user on the home screen.

## Prerequisites

- TASK-21 and TASK-22 must be complete (backend OAuth endpoints live).
- The backend `FrontendBaseUrl` config must point to the running frontend origin.

## New / Updated Files

### `frontend/src/api/auth.js`  *(updated)*

Add two new exports and update `register` to include optional email:

```js
export const register = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });

// data: { identifier, password }  (identifier = username or email)
export const login = (data) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const getMe = () => apiFetch('/api/auth/me');

// Redirect the browser to the backend OAuth start URL
export const loginWithGoogle   = () => { window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/auth/google`; };
export const loginWithFacebook = () => { window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/auth/facebook`; };
```

### `frontend/src/screens/OAuthCallbackScreen.jsx`  *(new)*

This screen is the landing page for the post-OAuth redirect (e.g. route `/auth/callback`).

**Behavior:**
1. On mount, read the `token` query param from the current URL (`new URLSearchParams(location.search).get('token')`).
2. If `token` is present:
   - Store it in `localStorage` under key `token`.
   - Call `getMe()` to load the user into `AuthContext`.
   - Strip `?token=...` from the browser URL (`history.replaceState`).
   - Navigate to `/`.
3. If `error` param is present (e.g. `?error=email_conflict`):
   - Display a user-friendly message, e.g.: "An account with that email already exists. Please sign in with your username and password instead."
   - Show a link back to `/login`.
4. If neither param is present, redirect to `/login`.

**Layout:**
```
[Centered, full-screen]
[Loading spinner (brief) while token is being processed]
[Error state if applicable]
```

### `frontend/src/screens/LoginScreen.jsx`  *(updated)*

Add social login buttons between the form and the "New? Claim your seat" link:

```
[Username or Email input]
[Password input]
[Error message]
[LOGIN button]

── or ──

[Sign in with Google button]
[Sign in with Facebook button]

[New? Claim your seat →]
```

**Behavior changes:**
- The username field label becomes "Username or Email" — the backend now accepts either.
- Clicking "Sign in with Google" calls `loginWithGoogle()` (full-page redirect).
- Clicking "Sign in with Facebook" calls `loginWithFacebook()` (full-page redirect).

**Social button styling:**
- `Sign in with Google`: white background, Google brand colors, Google "G" logo SVG inline.
- `Sign in with Facebook`: Facebook blue (`#1877F2`), white text, Facebook "f" logo SVG inline.
- Both buttons: full width, 44px min height, rounded, border, subtle hover state.
- Use the actual Google and Facebook brand guidelines for button text: "Sign in with Google", "Continue with Facebook".

### `frontend/src/screens/RegisterScreen.jsx`  *(updated)*

Add optional email field and social register buttons:

```
[Display Name input]
[Username input]
[Email input — optional, "For account recovery (optional)"]
[Password input]
[Confirm Password input]
[Error message]
[CLAIM YOUR SEAT button]

── or ──

[Sign up with Google button]
[Sign up with Facebook button]

[Already a shareholder? Sign in →]
```

**Behavior changes:**
- Email field: optional, validated as a valid email format if filled in. Passed to `auth.register`.
- Social buttons call `loginWithGoogle()` / `loginWithFacebook()` — same flow as login (backend creates account on first visit).

### `frontend/src/context/AuthContext.jsx`  *(updated)*

The `AuthProvider` already reads from `localStorage` on mount. No structural changes needed — `OAuthCallbackScreen` writes the token directly to `localStorage` and calls `getMe()` before navigating, so the context will be populated correctly.

However, update `handleLogin` to pass `identifier` instead of `username`:

```js
const handleLogin = async ({ identifier, password }) => {
  const { token, user } = await login({ identifier, password });
  localStorage.setItem('token', token);
  setUser(user);
  return user;
};
```

### `frontend/src/App.jsx`  *(updated)*

Add the new route:
```jsx
<Route path="/auth/callback" element={<OAuthCallbackScreen />} />
```

## Styling Notes

- The "── or ──" divider between the form and social buttons: a horizontal rule with centered text, consistent with the existing `· · ·` divider style used in TASK-13.
- Social buttons should not try to match the dark steak-house palette — keep them on-brand per Google/Facebook guidelines (white/blue), since users recognize these and expect the standard look.
- On small screens (390px), the social buttons stack vertically with 8px gap.

## Acceptance Criteria

- [ ] "Sign in with Google" button on LoginScreen initiates the Google OAuth flow.
- [ ] "Sign in with Facebook" button on LoginScreen initiates the Facebook OAuth flow.
- [ ] After successful OAuth, `OAuthCallbackScreen` stores the token and navigates to Home.
- [ ] After OAuth with a conflicting email, `OAuthCallbackScreen` shows a clear error and a link back to login.
- [ ] Register form accepts an optional email field and passes it to the backend.
- [ ] Login form accepts either username or email as the identifier.
- [ ] Social buttons meet basic brand guidelines (correct colors, correct logo, correct button text).
- [ ] All existing login/register acceptance criteria from TASK-13 still pass.
- [ ] No `?token=...` remains visible in the browser URL bar after OAuth callback.
