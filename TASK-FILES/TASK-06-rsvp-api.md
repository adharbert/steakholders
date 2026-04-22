---
status: complete
---

# TASK-06 · RSVP / Attendance API

Endpoints for users to RSVP to meatups and view who's attending.

## Goal

Any authenticated user can RSVP to a meatup. The Home screen "GOING" button and attendee avatar stack are driven by this data.

## Endpoints

### POST /api/meatups/{meatupId}/rsvp  *(requires JWT)*
Create or update the calling user's RSVP for a meatup.

**Request body:**
```json
{ "status": "going" }
```
Valid status values: `"going"`, `"maybe"`, `"not_going"`.

- If an Attendance record already exists for `(meatupId, userId)`, update it (upsert).
- Returns `200 OK` with:
```json
{
  "meatupId": 1,
  "userId": 2,
  "status": "going",
  "respondedAt": "2026-04-16T10:00:00Z"
}
```

### GET /api/meatups/{meatupId}/attendees  *(requires JWT)*
Returns the full attendee list for a meatup, including each user's display name, role, and RSVP status.

**Response `200 OK`:**
```json
[
  { "userId": 1, "displayName": "Katie", "role": "President", "status": "going" },
  { "userId": 2, "displayName": "Andy", "role": "Founder", "status": "going" }
]
```

### DELETE /api/meatups/{meatupId}/rsvp  *(requires JWT)*
Remove the calling user's RSVP. Returns `204 No Content`.

## Implementation Steps

1. Add routes to `backend/Endpoints/MeatupEndpoints.cs` (or a new `AttendanceEndpoints.cs`).
2. Use an upsert pattern for the POST:
   - Check if a row exists for `(meatupId, userId)`.
   - If yes, update `Status` and `RespondedAt`.
   - If no, insert new Attendance row.
3. Return 404 if the meatupId doesn't exist.

## Notes

- The attendee avatar stack on the Home screen shows the first 4 going attendees plus a count.
- The Bill/Split screen (TASK-09) uses the `going` attendee list to calculate per-person share.

## Acceptance Criteria

- [ ] `POST /api/meatups/{id}/rsvp` with `"going"` adds the user to the attendee list.
- [ ] Re-POSTing with `"maybe"` updates the existing record (no duplicate rows).
- [ ] `GET /api/meatups/{id}/attendees` returns all attendees with correct statuses.
- [ ] `DELETE /api/meatups/{id}/rsvp` removes the user's RSVP.
- [ ] Returns 404 for a non-existent meatupId.
