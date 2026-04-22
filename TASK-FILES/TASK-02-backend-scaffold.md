---
status: complete
---

# TASK-02 · C# Backend Scaffold

Bootstrap the ASP.NET Core 8 Web API project with all required packages.

## Goal

Create a runnable, empty API project in `backend/` with all NuGet packages installed and CORS configured for the frontend dev server.

## Steps

1. In `backend/`, run:
   ```
   dotnet new webapi -n SteakholdersMeatup --use-minimal-apis
   ```
2. Add NuGet packages:
   ```
   dotnet add package Microsoft.EntityFrameworkCore.Sqlite
   dotnet add package Microsoft.EntityFrameworkCore.Design
   dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
   dotnet add package BCrypt.Net-Next
   ```
3. Configure CORS in `Program.cs` to allow `http://localhost:5173` (Vite dev server) and any production origin set via env var `ALLOWED_ORIGINS`.
4. Configure Swagger/OpenAPI (included by default in .NET 8 minimal API template) — accessible at `/swagger` in Development only.
5. Configure `appsettings.Development.json` with:
   ```json
   {
     "ConnectionStrings": { "Default": "Data Source=steakholders.db" },
     "Jwt": {
       "Secret": "dev-secret-change-me-in-production-32chars",
       "Issuer": "steakholders-api",
       "Audience": "steakholders-app",
       "ExpiryMinutes": 10080
     }
   }
   ```
6. Register `AppDbContext` as a scoped service using the SQLite connection string.
7. Add a health check endpoint: `GET /health` → `{ "status": "ok" }`.
8. Confirm `dotnet run` starts without errors and `/health` returns 200.

## File Layout

```
backend/
├── SteakholdersMeatup.csproj
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── Data/
│   └── AppDbContext.cs          (created in TASK-03)
├── Models/                      (created in TASK-03)
├── DTOs/
├── Endpoints/
└── steakholders.db              (auto-created by EF migrations)
```

## Acceptance Criteria

- [ ] `dotnet run` succeeds.
- [ ] `GET /health` returns `{ "status": "ok" }`.
- [ ] Swagger UI loads at `http://localhost:5000/swagger`.
- [ ] CORS allows requests from `http://localhost:5173`.
