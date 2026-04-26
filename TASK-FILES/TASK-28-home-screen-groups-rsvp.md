---
status: complete
---

# TASK-28 · Home Screen — Groups & Pending RSVPs

Update the Home screen to surface pending RSVP requests and group membership.

## Goal

When a meatup is created for a group, all active members get a `"pending"` Attendance record. The Home screen now shows a section so members can quickly respond. Groups the user belongs to are also surfaced as chip buttons.

## Changes to `HomeScreen.jsx`

### Pending RSVP Section (new)
- Appears **above** "Upcoming Meatup" when there are pending RSVPs.
- Section label: "Awaiting Your RSVP"
- Each card shows: meatup display name, date, group name (if any), + **Going** / **Skip** buttons.
- Responding removes the card from the list immediately (optimistic).
- Data source: `getMeatups({})` filtered by `myRsvpStatus === "pending"` and `eventDate > now`.

### My Groups Section (new)
- Appears between "Upcoming Meatup" and "The Ledger".
- **If user has groups:** shows horizontal chip row — each chip shows group name + member count, clickable → `/groups/{id}`. A `+ Join` chip links to `/groups/join`.
- **If no groups:** shows empty state with "Join a Group" + "Create Group" buttons side-by-side.

### Upcoming Meatup Card (updated)
- `restaurantName` / `location` replaced with `displayName` / `displayLocation` from the new `MeatupSummaryDto`.
- Group name shown below location when present (`Users` icon + group name).

## MeatupSummaryDto Changes

The backend `MeatupSummaryDto` now uses computed display fields instead of raw DB fields:

| Old | New |
|---|---|
| `RestaurantName` | `DisplayName` — Restaurant.Name or VenueName |
| `Location` | `DisplayLocation` — City, State from Restaurant or venue fields |
| *(new)* | `GroupId` |
| *(new)* | `GroupName` |
| *(new)* | `VenueType` |

## Files Modified

- `frontend/src/screens/HomeScreen.jsx`
- `backend/DTOs/MeatupDtos.cs`
- `backend/Endpoints/MeatupEndpoints.cs`
