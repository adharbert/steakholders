---
status: complete
---

# TASK-14 · Home Screen

Implement the Home screen, matching the original mockup with live data from the API.

## Goal

The Home screen is the app's landing page after login. It shows the user's greeting, the next upcoming meatup with RSVP button, their personal stats ledger, and a feed of recent reviews.

## File

`frontend/src/screens/HomeScreen.jsx`

## Layout (matches original mockup)

```
[Header]
  Brand mark: "Steakholders · Meatup"     [Avatar: user initial]
  "Good evening, [DisplayName]"
  "Your next cut awaits."

[Section: UPCOMING MEATUP]
  [UpcomingCard — see below]

[Section: THE LEDGER]
  [3-column stat grid]
    14 Meatups | 4.2 Avg Score | $847 Your Spend

[Section: RECENT REVIEWS]
  [ReviewListItem] × 3–5 most recent
```

## Components

### `<UpcomingCard meatup={meatup} onRsvp={fn} />`

Renders the next upcoming meatup (lowest future `eventDate`). If no upcoming meatup exists, show a placeholder card: "No meatup scheduled — the shareholders await your call."

Fields to display:
- `eventDate` formatted as "FRI · MAY 15 · 7:30 PM" (use the user's local timezone)
- `restaurantName`
- `location` with MapPin icon
- Attendee avatar stack (first 4 `going` attendees, then count) e.g. "6 shareholders confirmed"
- RSVP button: shows "GOING" (gold, active state) if user's status is "going", otherwise "RSVP"

On RSVP button click:
- If currently "going": prompt a simple confirm dialog ("Leave this meatup?") and toggle to `not_going`.
- If not going: call `rsvp(meatupId, 'going')` and update button state immediately (optimistic update).

### Stats Ledger

Fetch from `GET /api/users/me/stats`. Show loading skeleton (three dim placeholder cards) while fetching. On error, show "—" values.

### `<ReviewListItem review={review} />`

Matches the review item from the mockup:
- Steak thumbnail (marbling gradient, no real photo for POC)
- Cut name (Playfair Display)
- `DISPLAYNAME · RESTAURANT · OZ OZ` meta line (mono)
- Tasting notes excerpt (2-line clamp)
- Score badge

Tapping a review list item navigates to the Review screen pre-loaded with that review's data (for now, show a read-only view if the review belongs to another user, or the edit form if it belongs to the current user).

## Data Fetching

On mount:
1. `getMeatups({ upcoming: true })` — get next meatup (first result).
2. `getMyStats()` — get ledger stats.
3. `getReviews({ limit: 5 })` — get 5 most recent reviews.

Use `Promise.all` to fetch in parallel.

Show a subtle loading state while data is fetched (dim skeleton cards, not a full-screen spinner).

## Greeting Logic

- 5am–11:59am → "Good morning"
- 12pm–4:59pm → "Good afternoon"
- 5pm–11:59pm → "Good evening"
- 12am–4:59am → "Late night, [name]. The steak waits."

## Acceptance Criteria

- [ ] Greeting shows the correct time-of-day phrase and the user's display name.
- [ ] Upcoming meatup card shows real data from the API.
- [ ] RSVP button reflects the user's current status and toggles correctly.
- [ ] Attendee avatar stack shows the first 4 going users plus the going count.
- [ ] Stats ledger shows real meatup count, avg score, and total spend.
- [ ] Recent reviews list shows the 5 most recent reviews.
- [ ] Tapping a review navigates to the review detail/edit screen.
- [ ] All data fetched in parallel on mount.
- [ ] Loading states shown while data is in flight.
