---
status: complete
---

# TASK-01 · Project Structure Setup

Set up the monorepo directory layout for the full-stack PWA.

## Goal

Establish the root-level directory structure so both the frontend and backend can coexist cleanly, share tooling config, and be run together in development.

## Directory Layout

```
steakholders-meatup/
├── frontend/          # Vite + React PWA
├── backend/           # C# ASP.NET Core Web API
├── TASK-FILES/
├── steakholders_meatup.jsx   # original mockup (reference only)
└── README.md
```

## Steps

1. Create `frontend/` and `backend/` directories.
2. Create a root `.gitignore` that excludes `node_modules/`, `bin/`, `obj/`, `.env`, `*.db`, `*.db-shm`, `*.db-wal`.
3. Create a root `README.md` documenting how to run both projects in development.
4. Create a root `docker-compose.yml` (optional/stretch) with services for `frontend` and `backend` for easy local startup.
5. Document the environment variables each service needs (see TASK-03 and TASK-09 for specifics).

## Environment Variables

**Backend (`backend/.env` or `appsettings.Development.json`):**
- `Jwt__Secret` — signing key (min 32 chars)
- `Jwt__Issuer` — e.g. `steakholders-api`
- `Jwt__Audience` — e.g. `steakholders-app`
- `ConnectionStrings__Default` — path to SQLite file, e.g. `Data Source=steakholders.db`

**Frontend (`frontend/.env`):**
- `VITE_API_BASE_URL` — e.g. `http://localhost:5000`

## Acceptance Criteria

- [ ] Directory structure exists as specified above.
- [ ] `.gitignore` covers all build artifacts and secrets.
- [ ] README explains `cd frontend && npm install && npm run dev` and `cd backend && dotnet run`.
