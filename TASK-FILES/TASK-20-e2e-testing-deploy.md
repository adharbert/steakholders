---
status: complete
---

# TASK-20 · End-to-End Testing & Deployment Configuration

Verify the full app works end-to-end and prepare it for deployment as a POC demo.

## Goal

Run through all core user flows against real backend + database, and produce a deployable build. No CI/CD infrastructure is required for this POC — a simple "how to run in production" guide is sufficient.

## End-to-End Test Checklist

Work through each flow manually (or with Playwright if time allows) to verify:

### Auth
- [ ] Register a new user → lands on Home screen
- [ ] Log out → redirected to Login
- [ ] Log in → lands on Home screen
- [ ] Refresh page while logged in → session restored (no redirect to login)
- [ ] Delete token from localStorage → next API call redirects to login

### Meatups
- [ ] Create a new meatup → appears in Upcoming Meatup card on Home
- [ ] RSVP "going" → avatar appears in attendee stack, count increments
- [ ] RSVP "not going" → avatar removed, count decrements
- [ ] Second user RSVPs → their avatar appears in stack

### Reviews
- [ ] Submit an order (cut name + weight) for a meatup → order recorded
- [ ] Rate the steak (all four categories) + add tasting notes → submitted confirmation shown
- [ ] Review appears in Home screen's Recent Reviews
- [ ] Review appears in Archive for that meatup
- [ ] Re-submit review (edit) → review updated, not duplicated

### Bill & Split
- [ ] Record the bill (total + tip %) → split amount calculated correctly
- [ ] Mark a member as PAID → badge turns green immediately (optimistic)
- [ ] Mark a member as PENDING → badge reverts to dim
- [ ] Attempting to create a second bill for the same meatup → 409 error shown

### PWA
- [ ] Open on mobile Chrome → "Add to Home Screen" available
- [ ] Installed PWA opens in standalone mode (no browser chrome)
- [ ] App loads offline after first visit (service worker serves cached shell)

## Production Build

### Frontend
```
cd frontend
npm run build
# Output in frontend/dist/
```
Serve `dist/` as a static site via any static host (Netlify, Vercel, Nginx, Caddy, etc.).

### Backend
```
cd backend
dotnet publish -c Release -o ./publish
# Run: dotnet SteakholdersMeatup.dll
```
Set environment variables for production:
- `ASPNETCORE_ENVIRONMENT=Production`
- `Jwt__Secret=<strong-random-secret-min-32-chars>`
- `ConnectionStrings__Default=Data Source=/data/steakholders.db`
- `AllowedOrigins=https://your-production-domain.com`

### Database Migrations in Production
```
dotnet ef database update --connection "Data Source=/data/steakholders.db"
```
Or run migrations on startup (already done in `Program.cs` via `db.Database.Migrate()`).

## Stretch: Playwright Smoke Tests

If time permits, add a `tests/` directory at the root with a minimal Playwright test suite:
```
tests/
├── auth.spec.js        — register, login, logout
├── meatup.spec.js      — create meatup, RSVP
├── review.spec.js      — submit review
└── bill.spec.js        — record bill, toggle payment
```

Install with `npm init playwright@latest` in the `tests/` directory.

## Acceptance Criteria

- [ ] All items in the End-to-End Test Checklist pass.
- [ ] `npm run build` in `frontend/` produces a valid dist with no errors.
- [ ] `dotnet publish` in `backend/` produces a self-contained publish folder.
- [ ] README documents how to run both services in production.
- [ ] The PWA passes a basic Chrome Lighthouse audit (≥ 90 PWA score).
