---
status: complete
---

# TASK-17 · Bill / Split Screen

Implement the Bill tab showing the check total, even split, and per-member payment status.

## Goal

After a meatup, the bill is entered once by any member and split evenly among all attendees who RSVPed "going". Each member's PAID/PENDING badge can be toggled. This matches the "The Bill" screen in the original mockup.

## File

`frontend/src/screens/BillScreen.jsx`

## Layout

```
[Header]
  "The Bill"                (Playfair italic)
  "[RestaurantName] · [Month Day]"

[Bill Summary Card]
  $1,284.50                (large Playfair italic)
  "Total · Tax + 22% Tip Included"
  "Split between 6 → $214.08 each"

[Section: SHAREHOLDERS]
  [MemberPaymentRow] × N

[Add Bill button — if no bill exists yet]
```

## `<MemberPaymentRow member={m} onTogglePaid={fn} />`

- Left: Avatar (initial + color)
- Center: Display name + role (mono)
- Right: PAID badge (green) or PENDING badge (dim), tappable to toggle

Tapping toggles the payment via `markPaid(meatupId, userId, !current)`. Show optimistic update immediately, revert on error.

## "Add Bill" Flow

If no bill exists for the selected meatup, show a button "Record the Bill" that opens a bottom sheet or in-screen form:

```
[Total Amount input — numeric, dollar amount]
[Tip % input — numeric, default 20]
[Tax Included? checkbox — default true]
[RECORD BILL button]
```

On submit: `createBill(meatupId, { totalAmount, tipPercent, taxIncluded })`.

After the bill is created, the form is replaced by the Bill Summary Card and shareholder list.

## Meatup Selector

The Bill tab needs to know which meatup's bill to show. Use the most recent past meatup the user attended, or show a simple top picker if there are multiple:

```
[← Previous]  Bern's · May 15  [Next →]
```

Allow cycling through attended meatups.

## No Meatup State

If the user hasn't attended any meatup yet:
```
"No meatups yet."
"Attend your first meatup to track the bill."
```

## Data Fetching

On mount:
1. `getMeatups({ past: true })` filtered by current user's attendance — or `getMeatups()` and filter client-side.
2. For the selected meatup: `getBill(meatupId)` — 404 means no bill yet, show "Record the Bill" button.
3. `getMeatup(meatupId)` for attendee list (to show all members even before a bill is entered).

## Acceptance Criteria

- [ ] Bill summary card shows correct total, tip %, and per-person split amount.
- [ ] Shareholder list shows all `going` attendees with their payment status.
- [ ] Tapping a member's PAID/PENDING badge toggles their status.
- [ ] Toggle is optimistic (UI updates immediately, reverts on error).
- [ ] "Record the Bill" form creates the bill and auto-creates payment rows.
- [ ] Meatup selector cycles through past attended meatups.
- [ ] "No bill yet" state shows "Record the Bill" button when no bill exists.
- [ ] "No meatups" empty state renders for new users.
