---
status: complete
---

# TASK-19 · Backend: CORS, Validation, Error Handling Polish

Harden the backend for real browser clients before end-to-end testing.

## Goal

Ensure the C# API is fully functional for both the Vite dev server proxy and production deployments. Add consistent error response shapes, input validation, and global exception handling.

## Steps

### 1. Consistent Error Response Format

All error responses should use a consistent JSON shape:
```json
{ "error": "Human-readable message", "code": "OPTIONAL_CODE" }
```

Create a `ProblemDetails`-style middleware or a shared `ApiError` helper record that all endpoints use. Never return a raw `500` with a stack trace in production.

### 2. Global Exception Middleware

In `Program.cs`, add a `UseExceptionHandler` that catches unhandled exceptions and returns:
```json
{ "error": "An unexpected error occurred." }
```
with status 500. Log the full exception via `ILogger`.

### 3. Input Validation

Add `DataAnnotations` or a small `FluentValidation` setup to validate request bodies. Return `400 Bad Request` with a descriptive `{ "error": "..." }` message for:
- Missing required fields
- Out-of-range values (e.g., rating not 1–5)
- Field length violations

### 4. CORS Configuration

Update CORS in `Program.cs` to read allowed origins from an environment variable:
```csharp
var origins = builder.Configuration["AllowedOrigins"]?.Split(',')
    ?? ["http://localhost:5173"];
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));
```

### 5. JWT 401 Response Body

By default ASP.NET Core returns an empty body for 401 responses. Override the `OnChallenge` event to return:
```json
{ "error": "Authentication required." }
```

### 6. Rate Limiting (stretch)

Add `Microsoft.AspNetCore.RateLimiting` with a fixed-window policy of 100 requests/minute per IP on auth endpoints (`/api/auth/*`). Return 429 with `{ "error": "Too many requests." }`.

### 7. Request Logging

Add `app.UseHttpLogging()` in Development so all requests are logged to the console. Disable in Production or switch to structured logging (Serilog is a stretch goal).

## Acceptance Criteria

- [ ] All error responses follow `{ "error": "..." }` shape.
- [ ] Unhandled exceptions return 500 with the generic message (no stack trace).
- [ ] `POST /api/auth/register` with missing fields returns 400 with a descriptive message.
- [ ] `POST /api/orders/{id}/review` with a rating of 0 or 6 returns 400.
- [ ] CORS works from `http://localhost:5173` in dev and from the production origin in prod.
- [ ] 401 responses include a JSON body.
