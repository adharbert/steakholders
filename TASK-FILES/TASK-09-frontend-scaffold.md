---
status: complete
---

# TASK-09 · Frontend Project Scaffold (Vite + React)

Bootstrap the React PWA project in `frontend/`.

## Goal

Create a Vite + React project with TypeScript, Tailwind CSS (or plain CSS modules), React Router, and all dependencies needed for the full app.

## Steps

1. In `frontend/`, run:
   ```
   npm create vite@latest . -- --template react
   ```
2. Install dependencies:
   ```
   npm install react-router-dom lucide-react
   npm install -D vite-plugin-pwa
   ```
3. Configure Vite in `vite.config.js`:
   - Add `VitePWA` plugin (configured fully in TASK-10).
   - Set `server.proxy` to forward `/api` requests to `http://localhost:5000` in dev.
4. Set up directory structure:
   ```
   frontend/src/
   ├── api/             # fetch wrappers (TASK-11)
   ├── components/      # shared UI components
   ├── screens/         # one file per tab/screen
   │   ├── HomeScreen.jsx
   │   ├── ArchiveScreen.jsx
   │   ├── ReviewScreen.jsx
   │   ├── BillScreen.jsx
   │   ├── LoginScreen.jsx
   │   └── RegisterScreen.jsx
   ├── context/
   │   └── AuthContext.jsx  (TASK-11)
   ├── styles/
   │   └── global.css   # ported from original JSX (TASK-12)
   ├── App.jsx
   └── main.jsx
   ```
5. Set up React Router in `App.jsx` with routes:
   - `/login` → `<LoginScreen />`
   - `/register` → `<RegisterScreen />`
   - `/` → `<HomeScreen />` (protected)
   - `/archive` → `<ArchiveScreen />` (protected)
   - `/review` → `<ReviewScreen />` (protected)
   - `/bill` → `<BillScreen />` (protected)
6. Create a `<ProtectedRoute>` wrapper that redirects to `/login` if no auth token is present.
7. Create a persistent bottom nav bar component `<NavBar />` with icons matching the original: Home, Archive (BookOpen), Review (Plus), Bill (Users).
8. Create a `<AppShell>` that wraps protected routes with the status bar, nav bar, and screen content.
9. Add Google Fonts in `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
   ```
10. Confirm `npm run dev` starts without errors and React Router renders the login screen for unauthenticated users.

## Acceptance Criteria

- [ ] `npm run dev` runs without errors.
- [ ] Visiting `/` redirects to `/login` when not authenticated.
- [ ] After login, the bottom nav bar is visible with 4 tabs.
- [ ] Each tab navigates to its screen.
- [ ] Google Fonts load correctly.
