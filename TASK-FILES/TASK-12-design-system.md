---
status: complete
---

# TASK-12 · Design System & Global Styles

Port the visual design from the original JSX mockup into a reusable CSS foundation and shared React components.

## Goal

Extract all styles from the inline `<style>` block in `steakholders_meatup.jsx` into a proper `global.css` file and a set of small reusable components that every screen can use.

## CSS Variables (`frontend/src/styles/global.css`)

Define the color palette and typography as CSS custom properties at `:root`:

```css
:root {
  --color-bg:          #0a0604;
  --color-surface:     #120907;
  --color-surface-2:   #1a0e0a;
  --color-surface-3:   #241310;
  --color-border:      rgba(201, 166, 120, 0.15);
  --color-border-dim:  rgba(201, 166, 120, 0.08);
  --color-gold:        #c9a678;
  --color-gold-dim:    rgba(201, 166, 120, 0.6);
  --color-cream:       #f4e8d0;
  --color-text:        #e8dcc8;
  --color-text-dim:    rgba(232, 220, 200, 0.55);
  --color-red:         #8b1e14;
  --color-red-dark:    #5a1008;
  --color-green:       #7a9a5c;

  --font-display:  'Playfair Display', serif;
  --font-body:     'Cormorant Garamond', serif;
  --font-mono:     'JetBrains Mono', monospace;
}
```

## Global Resets

Port the `* { box-sizing: border-box; margin: 0; padding: 0; }` reset and the `body` background color. Add safe-area and overscroll rules from TASK-10.

## Shared Components to Create

### `<SectionLabel label="Upcoming Meatup" />`
The gold monospace section header with a gradient divider line.

### `<Avatar initial="K" color="red" size="sm|md|lg" />`
The gradient circular avatar used in the header, attendee stack, and member list. Color options: `red` (default), `blue`, `green`, `gold`.

### `<ScoreBadge score={4.6} />`
The italic Playfair score display (`4.6/5`).

### `<PaidBadge paid={true} />`
PAID (green) or PENDING (dimmed) badge used in the Bill screen.

### `<StarRating value={3} onChange={fn} label="Flavor" />`
A single rating row with label and 5 clickable stars. Extracted from the review form.

### `<MarbleTexture />`
The CSS radial gradient marbling effect div used on steak thumbnails and cards.

### `<GrainOverlay />`
The SVG noise overlay div.

### `<LoadingSpinner />`
Simple animated spinner for async states, styled in the app's gold color.

### `<ErrorMessage message="..." />`
Inline error display for form validation and API errors.

## App Shell Layout

The main `<AppShell>` component provides:
- Full-viewport dark background
- A scrollable content area (`overflow-y: auto; height: calc(100vh - 64px)`)
- The fixed bottom `<NavBar>` at the bottom
- Safe area padding via CSS env variables

The phone-frame wrapper from the original mockup should be **removed** — in the real PWA, the app fills the full screen (standalone mode).

## Acceptance Criteria

- [ ] All CSS variables are defined and used consistently across screens.
- [ ] All shared components render correctly and match the original mockup's visual style.
- [ ] No inline `style={}` props for colors/typography — all visual styling goes through CSS classes or CSS variables.
- [ ] App renders correctly at 390px (iPhone 14 viewport) and 360px (common Android viewport).
- [ ] No visible layout breakage when system font size is increased (accessibility).
