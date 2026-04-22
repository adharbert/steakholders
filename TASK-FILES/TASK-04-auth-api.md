---
status: complete
---

# TASK-04 · Authentication API (Register, Login, JWT)

Implement user registration and login endpoints with JWT token issuance.

## Goal

Users can create an account with just a username and password (no email required for this POC). On login, they receive a JWT that they include in subsequent API calls via `Authorization: Bearer <token>`.

## Endpoints

### POST /api/auth/register
**Request body:**
```json
{
  "username": "katie",
  "password": "hunter2",
  "displayName": "Katie"
}
```
**Behavior:**
- Validate: username 3–50 chars, alphanumeric + underscores only; password min 8 chars.
- Check username uniqueness (case-insensitive). Return `409 Conflict` with `{ "error": "Username already taken" }` if duplicate.
- Hash password with BCrypt (work factor 12).
- Create User record with `Role = "Member"` by default.
- Return `201 Created` with the same shape as login response below.

### POST /api/auth/login
**Request body:**
```json
{
  "username": "katie",
  "password": "hunter2"
}
```
**Response `200 OK`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "katie",
    "displayName": "Katie",
    "role": "Member"
  }
}
```
- Return `401 Unauthorized` with `{ "error": "Invalid credentials" }` on bad username or password.
- Use the same generic error message for both cases (do not reveal which was wrong).

### GET /api/auth/me  *(requires JWT)*
Returns the currently authenticated user's profile. Used by the frontend on app load to restore session.

**Response `200 OK`:**
```json
{
  "id": 1,
  "username": "katie",
  "displayName": "Katie",
  "role": "Member"
}
```

## JWT Configuration

- Algorithm: HS256
- Claims: `sub` (user ID as string), `name` (displayName), `role`
- Expiry: configurable via `Jwt__ExpiryMinutes` (default 10080 = 7 days for POC)
- Signed with `Jwt__Secret` from config

## Implementation Steps

1. Create `backend/Endpoints/AuthEndpoints.cs` with the three routes mapped as minimal API endpoints.
2. Create `backend/DTOs/AuthDtos.cs` with `RegisterRequest`, `LoginRequest`, `AuthResponse`, `UserDto`.
3. Create `backend/Services/TokenService.cs` that generates and validates JWTs.
4. Register `TokenService` as a singleton in `Program.cs`.
5. Add `AddAuthentication().AddJwtBearer(...)` and `AddAuthorization()` in `Program.cs`.
6. Call `app.UseAuthentication(); app.UseAuthorization();` before endpoint mapping.

## Acceptance Criteria

- [ ] `POST /api/auth/register` creates a new user and returns a token.
- [ ] `POST /api/auth/login` with correct credentials returns a token.
- [ ] `POST /api/auth/login` with wrong credentials returns 401 (same message for both failure modes).
- [ ] `GET /api/auth/me` with a valid token returns the user object.
- [ ] `GET /api/auth/me` without a token returns 401.
- [ ] Duplicate username registration returns 409.
- [ ] Passwords are stored as bcrypt hashes, never plaintext.
