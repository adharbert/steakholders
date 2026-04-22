---
status: complete
---

# TASK-10 · PWA Configuration (Manifest, Service Worker, iOS/Android)

Make the app installable to the home screen on iOS Safari and Android Chrome/Firefox.

## Goal

A fully configured Progressive Web App that passes Chrome Lighthouse PWA audit and can be added to the home screen on both iOS and Android with a proper icon, splash screen, and offline shell.

## Steps

### 1. Web App Manifest (`public/manifest.json`)

```json
{
  "name": "Steakholders Meatup",
  "short_name": "Meatup",
  "description": "Track steak dinners, reviews, and bill splits with your group.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0604",
  "theme_color": "#0a0604",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 2. App Icons

Create `public/icons/` with three PNG icons:
- **icon-192.png** (192×192) — a stylized dark-background flame/steak icon
- **icon-512.png** (512×512) — same design, larger
- **icon-512-maskable.png** (512×512) — same design with safe zone padding for Android adaptive icons

Use any SVG-to-PNG tool or a simple canvas script. The icon should use the app's dark red/gold color scheme (`#8b1e14` background, `#c9a678` flame).

### 3. Vite PWA Plugin (`vite.config.js`)

```js
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icons/*.png'],
  manifest: false,  // use the public/manifest.json file directly
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 }
        }
      }
    ]
  }
})
```

### 4. `index.html` Meta Tags

Add inside `<head>`:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Meatup">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a0604">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### 5. Safe Area Insets (iOS notch / dynamic island)

In `global.css`, add:
```css
.app-shell {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
.nav-bar {
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
}
```

### 6. Service Worker Registration

`vite-plugin-pwa` auto-registers the service worker. Ensure the generated `sw.js` is served at the root. In production, the service worker enables offline loading of the app shell.

### 7. Prevent Scroll Bounce on iOS

In `global.css`:
```css
html, body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}
```

## Acceptance Criteria

- [ ] `manifest.json` is valid and linked from `index.html`.
- [ ] All three icon sizes are present and referenced in the manifest.
- [ ] On Android Chrome, "Add to Home Screen" prompt appears (or manual install works).
- [ ] On iOS Safari, "Add to Home Screen" adds the app with the correct icon and `standalone` display mode.
- [ ] Chrome Lighthouse PWA audit scores ≥ 90.
- [ ] App shell loads offline after first visit (service worker serves cached assets).
- [ ] Safe area insets are respected on iPhone with notch.
