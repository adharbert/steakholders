---
status: pending
---

# TASK-22 · Backend Social Authentication (Google & Facebook OAuth)

Add OAuth 2.0 login/registration endpoints for Google and Facebook, and update the existing register/login endpoints to support email.

## Goal

Users can authenticate via Google or Facebook. The backend handles the OAuth code-exchange, looks up or creates a `User` record, and issues the same JWT used everywhere else in the app. Email/password registration is also updated to accept an email address.

## Prerequisites

- TASK-21 (User model with `Email`, `AuthProvider`, `ProviderUserId`, nullable `PasswordHash`) must be complete.
- Google OAuth app and Facebook app credentials must be created in their respective developer consoles and stored in app config (see Environment Variables below).

## Environment Variables

Add to `appsettings.json` (secrets go in `appsettings.Development.json` or user secrets — never commit real values):

```json
{
  "OAuth": {
    "Google": {
      "ClientId": "",
      "ClientSecret": "",
      "CallbackPath": "/api/auth/google/callback"
    },
    "Facebook": {
      "ClientId": "",
      "ClientSecret": "",
      "CallbackPath": "/api/auth/facebook/callback"
    }
  }
}
```

The frontend base URL (for post-OAuth redirect) should also be configurable:
```json
{
  "App": {
    "FrontendBaseUrl": "http://localhost:5173"
  }
}
```

## Updated Endpoints

### POST /api/auth/register  *(updated)*
Accept optional `email` field. If provided, validate format and uniqueness (return `409` with `{ "error": "Email already in use" }` on duplicate).

**Updated request body:**
```json
{
  "username": "katie",
  "password": "hunter2",
  "displayName": "Katie",
  "email": "katie@example.com"
}
```

### POST /api/auth/login  *(updated)*
Accept either `username` OR `email` in the `identifier` field (or keep separate `username`/`email` fields — pick one and document it).

**Updated request body:**
```json
{
  "identifier": "katie@example.com",
  "password": "hunter2"
}
```
- Look up user by username first; if not found, try email lookup.

---

### GET /api/auth/google
Redirects the browser to Google's OAuth 2.0 authorization URL.

**Query params to include in the Google auth URL:**
- `client_id` from config
- `redirect_uri` = `{backendBaseUrl}/api/auth/google/callback`
- `response_type=code`
- `scope=openid email profile`
- `state` = a short random CSRF token (store in a short-lived cookie or session)

### GET /api/auth/google/callback
Handles the redirect back from Google.

**Steps:**
1. Validate `state` param matches the cookie/session value (CSRF check).
2. Exchange `code` for tokens via `POST https://oauth2.googleapis.com/token`.
3. Decode the `id_token` (JWT) to extract `sub` (Google user ID), `email`, `name`.
4. Look up `User` where `AuthProvider = "google"` AND `ProviderUserId = sub`.
   - If found: this is a returning user — issue our JWT and redirect.
   - If not found: check if a user with the same email exists (email conflict). If a local user already has that email, return an error page/redirect with `?error=email_conflict`.
   - Otherwise: create a new `User` with `AuthProvider = "google"`, `ProviderUserId = sub`, `Email = email`, `DisplayName = name`, auto-generated unique `Username` (e.g., slugify the name + random suffix), `PasswordHash = null`, `Role = "Member"`.
5. Issue our JWT and redirect to `{FrontendBaseUrl}/?token={jwt}` (or a dedicated `/auth/callback?token=` route on the frontend).

### GET /api/auth/facebook
Same pattern as Google — redirects to Facebook's authorization URL.

**Facebook OAuth URL:** `https://www.facebook.com/v19.0/dialog/oauth`
- `scope=email,public_profile`

### GET /api/auth/facebook/callback
Same pattern as Google callback.
- Exchange code via `POST https://graph.facebook.com/v19.0/oauth/access_token`.
- Fetch user info via `GET https://graph.facebook.com/me?fields=id,name,email&access_token=...`.
- `ProviderUserId` = Facebook `id`.

## New Files

- `backend/Endpoints/SocialAuthEndpoints.cs` — the four new routes.
- `backend/Services/OAuthService.cs` — helpers for building auth URLs and exchanging codes (keeps endpoint handlers thin).
- `backend/DTOs/AuthDtos.cs` — update `RegisterRequest` to add `Email?`.

## Implementation Notes

- Use `System.Net.Http.HttpClient` (injected via DI) for the token-exchange HTTP calls; do not use a third-party OAuth library to keep dependencies minimal.
- The CSRF `state` token can be a random GUID stored in a `SameSite=Lax` cookie with a 10-minute expiry.
- Auto-generated usernames: take the first part of the display name, lowercase, strip non-alphanumeric, append 4 random digits. Check uniqueness and retry if taken.
- For the token-passback redirect, use a short-lived URL approach: `?token=<jwt>` in the redirect URL. The frontend reads it from the URL, stores it in localStorage, and strips it from the address bar.

## Acceptance Criteria

- [ ] `POST /api/auth/register` accepts optional `email`; stores it hashed if provided.
- [ ] `POST /api/auth/login` accepts either username or email as the identifier.
- [ ] `GET /api/auth/google` redirects to Google's authorization URL with correct params.
- [ ] `GET /api/auth/google/callback` creates a new user on first Google login and issues a JWT.
- [ ] `GET /api/auth/google/callback` returns the existing user's JWT on subsequent Google logins.
- [ ] `GET /api/auth/facebook` and callback work the same way as Google.
- [ ] Attempting to OAuth-register with an email already used by a local account returns a meaningful error (no silent data merge).
- [ ] CSRF state check rejects callbacks with a missing or wrong `state` param.
- [ ] No client secrets appear in logs or error responses.
