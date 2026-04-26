---
status: complete
---

# TASK-18 · Meatup Creation Screen

Allow users to schedule a new meatup event with venue type selection, restaurant search, and group assignment.

## Goal

Any logged-in user can create a new meatup. Supports four venue types (restaurant, home, park, other). Restaurant events require selecting from the local restaurant database. Non-restaurant events take a venue name and optional address. If a group is selected, all active members get auto-RSVPed as "pending".

## File

`frontend/src/screens/CreateMeatupScreen.jsx`

## Route

`/meatups/new` (protected)

## Layout

```
[← BACK]
[Header: "Schedule a Meatup"]
[Subheading: "The shareholders await your call."]

[Venue Type selector — pill buttons: Restaurant | Home | Park | Other]

[Group picker — dropdown, optional — shows if user belongs to any groups]
  hint: "All active group members will get an RSVP request."

[IF venue type == "restaurant"]
  [Restaurant search input + Search button]
    → shows result list (name, city/state) on search
    → selecting a result replaces input with "selected" display + "Change ×" button

[IF venue type != "restaurant"]
  [Venue Name input — required]
  [City input — optional]
  [State + Zip — optional, side by side]

[Date — date picker, required]
[Time — time picker, required]
[Notes — textarea, optional]

[Error message]
[CALL THE MEATUP button]
```

## Behavior

- Venue type defaults to "restaurant".
- Changing venue type clears any selected restaurant or venue fields.
- Restaurant search calls `GET /api/restaurants/search?q=<query>`.
- Group picker populated from `GET /api/groups/my`.
- On submit, sends `createMeatup({ venueType, eventDate, groupId, notes, restaurantId, venueName, venueCity, venueState, venueZip })`.
- On success: navigate to `/home`.

## Entry Points

1. Home screen "Schedule a Meatup" button.
2. `+` icon in the Home screen header.

## API Dependencies

- `POST /api/meatups` — create meatup
- `GET /api/restaurants/search` — restaurant search
- `GET /api/groups/my` — group list for picker

## Acceptance Criteria

- [ ] Venue type selector shows four options; switching clears venue-specific fields.
- [ ] Restaurant search works; selected restaurant shown with "Change" option.
- [ ] Non-restaurant venues accept name + optional address.
- [ ] Group picker shown when user is in at least one group; hint shows when group selected.
- [ ] Date/time validation: required, must be in the future.
- [ ] On success, navigated to Home.
- [ ] All group members get pending RSVP (server-side).
