---
status: complete
---

# TASK-05 · Meatups API

CRUD endpoints for creating and managing meatup events.

## Goal

Allow users to view upcoming and past meatups, and create new ones. All endpoints require authentication.

## Endpoints

### GET /api/meatups
Returns a list of all meatups, newest first. Query params:
- `?upcoming=true` — only future meatups (EventDate > now)
- `?past=true` — only past meatups

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "restaurantName": "Bern's Steak House",
    "location": "Tampa, Florida",
    "eventDate": "2026-05-15T23:30:00Z",
    "attendeeCount": 6,
    "myRsvpStatus": "going",
    "averageScore": 4.3,
    "createdBy": { "id": 1, "displayName": "Katie" }
  }
]
```

### GET /api/meatups/{id}
Returns full meatup detail including attendee list and all reviews.

**Response `200 OK`:**
```json
{
  "id": 1,
  "restaurantName": "Bern's Steak House",
  "location": "Tampa, Florida",
  "eventDate": "2026-05-15T23:30:00Z",
  "notes": null,
  "attendees": [
    { "userId": 1, "displayName": "Katie", "role": "President", "status": "going" }
  ],
  "reviews": [
    {
      "id": 1,
      "userId": 1,
      "displayName": "Katie",
      "cutName": "Dry-Aged Ribeye",
      "weightOz": 22,
      "overallScore": 4.6,
      "donenessRating": 5,
      "flavorRating": 5,
      "tendernessRating": 4,
      "valueRating": 4,
      "notes": "Crust was mesmerizing...",
      "createdAt": "2026-05-16T01:00:00Z"
    }
  ],
  "bill": null
}
```

### POST /api/meatups  *(requires JWT)*
Creates a new meatup. The creating user is automatically added as "going".

**Request body:**
```json
{
  "restaurantName": "Peter Luger",
  "location": "Brooklyn, NY",
  "eventDate": "2026-07-10T23:00:00Z",
  "notes": "Reservation under Andy"
}
```
Returns `201 Created` with the new meatup object.

### PUT /api/meatups/{id}  *(requires JWT, creator only)*
Update meatup details. Returns `200 OK` with updated object or `403 Forbidden` if caller is not the creator.

### DELETE /api/meatups/{id}  *(requires JWT, creator only)*
Soft-delete or hard-delete (hard is fine for POC). Returns `204 No Content`.

## Implementation Steps

1. Create `backend/Endpoints/MeatupEndpoints.cs`.
2. Create `backend/DTOs/MeatupDtos.cs` with request/response shapes.
3. Map endpoints in `Program.cs` with `.RequireAuthorization()`.
4. Include attendee count and the calling user's RSVP status on list responses (JOIN with Attendances table).
5. Include computed `averageScore` from Reviews via a subquery or LINQ.

## Acceptance Criteria

- [ ] `GET /api/meatups?upcoming=true` returns only future meatups.
- [ ] `GET /api/meatups/{id}` returns full detail with attendees and reviews.
- [ ] `POST /api/meatups` creates a meatup and auto-RSVPs the creator as "going".
- [ ] `PUT /api/meatups/{id}` returns 403 when called by a non-creator.
- [ ] All endpoints return 401 when called without a JWT.
