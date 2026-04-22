# Steakholders Meatup

A progressive mobile web app for tracking group steakhouse dinners — reviews, bill splits, and the ledger of every cut.

## Stack

- **Frontend**: Vite + React (PWA, installable on iOS Safari / Android Chrome)
- **Backend**: ASP.NET Core 8 minimal API (C#)
- **Database**: SQLite via Entity Framework Core

## Development

### Prerequisites

- .NET 10 SDK
- Node.js 18+
- `dotnet-ef` tool: `dotnet tool install --global dotnet-ef`

### Backend

```bash
cd backend/SteakholdersMeatup
dotnet run
```

API runs at `http://localhost:5000`. Swagger UI at `http://localhost:5000/swagger`.

Database (`steakholders.db`) is auto-created on first run with seed data including 4 demo users:
- `katie` / `password123`
- `andy`  / `password123`
- `jordan`/ `password123`
- `marcus`/ `password123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. API calls proxy to `http://localhost:5000`.

## Production Build

### Frontend

```bash
cd frontend
npm run build
# Serve frontend/dist/ as a static site
```

### Backend

```bash
cd backend/SteakholdersMeatup
dotnet publish -c Release -o ./publish
# Run: dotnet publish/SteakholdersMeatup.dll
```

Required environment variables for production:

| Variable | Example |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `Jwt__Secret` | 32+ char random string |
| `Jwt__Issuer` | `steakholders-api` |
| `Jwt__Audience` | `steakholders-app` |
| `ConnectionStrings__Default` | `Data Source=/data/steakholders.db` |
| `AllowedOrigins` | `https://your-domain.com` |

## Features

- JWT authentication (username + password, no email required)
- Schedule meatup events; RSVP as going/maybe/not going
- Log your steak order (cut name, weight)
- Submit 4-category reviews: Doneness, Flavor, Tenderness, Value + tasting notes
- Record and split the bill evenly; track who's paid
- Archive of all past meatups with full review history
- Installable PWA for iOS and Android home screen
