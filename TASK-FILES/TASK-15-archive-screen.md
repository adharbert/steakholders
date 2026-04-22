---
status: complete
---

# TASK-15 · Archive Screen

Implement the Archive screen — a full history of all past meatups.

## Goal

The Archive tab shows every past meatup the group has attended, with the restaurant name, date, location, best cut ordered, and the group's average review score. Tapping a meatup opens a detail view.

## File

`frontend/src/screens/ArchiveScreen.jsx`

## Layout

```
[Header]
  "The Archive"           (Playfair italic)
  "Every cut, every verdict."

[Meatup list — sorted newest first]
  [MeatupArchiveItem] × N

[Empty state — if no past meatups]
  "The ledger is empty. Attend your first meatup to begin the archive."
```

## `<MeatupArchiveItem meatup={meatup} />`

Matches the review item card style from the original mockup:
- Left: steak thumbnail (marbling gradient)
- Center:
  - Restaurant name (Playfair Display, 17px)
  - `DATE · LOCATION` (mono, 9px, gold)
  - Featured cut name (italic body text, truncated)
- Right: average score badge

Data fields needed per item:
- `restaurantName`
- `location`
- `eventDate` formatted as "MAR 12" (month + day)
- `averageScore` (may be null if no reviews submitted)
- `featuredCut`: the highest-rated cut from that meatup (or first if tied)

## Meatup Detail View

When a meatup is tapped, navigate to `/archive/:meatupId` (or use an in-screen slide-in panel for a more mobile-native feel).

The detail view shows:
```
[← BACK button]

[Hero card: restaurant name, date, location]

[Section: REVIEWS]
  [ReviewListItem] for each review in this meatup
  Each review shows: user display name, cut name, oz, score, notes

[Section: THE BILL (if a bill exists)]
  Total, tip %, split amount
  [Member payment status list]

[Section: ATTENDEES]
  [Avatar + name + role] × N
```

## Data Fetching

On Archive screen mount:
- `getMeatups({ past: true })` — fetch all past meatups, newest first.

On meatup detail:
- `getMeatup(id)` — fetches the full meatup including reviews, attendees, and bill.

## Infinite Scroll / Pagination (stretch)

For the POC, load all records at once. Add `?limit=20&offset=N` support as a stretch goal if the list gets long.

## Acceptance Criteria

- [ ] Archive list shows all past meatups in reverse chronological order.
- [ ] Each item shows restaurant name, date, location, featured cut, and average score.
- [ ] Tapping a meatup shows the detail view with reviews, bill, and attendees.
- [ ] "No past meatups" empty state renders when list is empty.
- [ ] Average score shows "—" if no reviews have been submitted for that meatup.
