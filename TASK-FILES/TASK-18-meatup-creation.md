---
status: complete
---

# TASK-18 · Meatup Creation Screen

Allow users to schedule a new meatup event.

## Goal

Any logged-in user can create a new meatup (schedule a steak dinner). The screen is accessible from the Home screen via a "Schedule a Meatup" button shown when no upcoming meatup exists, or via a `+` button in the header.

## File

`frontend/src/screens/CreateMeatupScreen.jsx`

## Route

`/meatups/new` (protected)

## Layout

```
[← BACK]
[Header: "Schedule a Meatup"]
[Subheading: "The shareholders await your call."]

[Restaurant Name input — required]
  placeholder: "e.g. Bern's Steak House"

[Location input — required]
  placeholder: "e.g. Tampa, Florida"

[Date input — date picker, required]
  Label: "Date"

[Time input — time picker, required]
  Label: "Time"

[Notes textarea — optional]
  placeholder: "Reservation details, dress code, etc."

[Error message (if any)]

[CALL THE MEATUP button — full width, dark red]
```

## Behavior

- Client-side validation before submit:
  - Restaurant Name: required, max 100 chars.
  - Location: required, max 100 chars.
  - Date: required, must be in the future.
  - Time: required.
- On submit: combine date + time into a UTC ISO string, then `createMeatup({ restaurantName, location, eventDate, notes })`.
- On success: navigate to `/` (Home), which will now show the new upcoming meatup.
- The creating user is automatically RSVPed as "going" (handled server-side per TASK-05).

## Entry Points

1. Home screen "Schedule a Meatup" button — shown in the Upcoming Meatup section when no upcoming meatup exists.
2. `+` icon button in the Home screen header (right side), always visible.

## Acceptance Criteria

- [ ] Form validates all required fields client-side.
- [ ] Submitting a past date shows "Date must be in the future."
- [ ] On success, user is navigated to Home and the new meatup appears in the Upcoming Meatup card.
- [ ] Creating user is automatically listed as "going" in the attendee list.
- [ ] Loading state shown on the submit button while the request is in flight.
