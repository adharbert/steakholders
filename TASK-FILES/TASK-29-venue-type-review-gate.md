---
status: complete
---

# TASK-29 · Venue Type & Review Gate

Enforce that orders and reviews are only allowed on restaurant-type meatups.

## Goal

Meatups can now be at non-restaurant venues (home, park, other). These are social events — no orders, no reviews. Only `VenueType == "restaurant"` meatups allow the review flow.

## Backend Changes

### `POST /api/meatups/{id}/orders` (OrderEndpoints / ReviewEndpoints)

Added check:
```csharp
if (meatup.VenueType != "restaurant")
    return Results.BadRequest(new { error = "Orders and reviews are only allowed for restaurant events." });
```

### `POST /api/orders/{id}/review` (ReviewEndpoints)

Added check after loading order:
```csharp
if (order.Meatup.VenueType != "restaurant")
    return Results.BadRequest(new { error = "Reviews are only allowed for restaurant events." });
```

### `GET /api/users/me/pending-reviews` (ReviewEndpoints)

Filtered to only include meatups where `VenueType == "restaurant"`:
```csharp
.Where(m => pendingIds.Contains(m.Id) && m.VenueType == "restaurant")
```

## MeatupEndpoints — Validation

`POST /api/meatups` validates:
- `VenueType` must be `restaurant | home | park | other`
- `VenueType == "restaurant"` requires `RestaurantId`
- `VenueType != "restaurant"` requires `VenueName`
- If `GroupId` specified, user must have `active` membership in that group

## Auto-RSVP on Create

When a meatup is created with a `GroupId`:
- All `active` GroupMemberships for that group are fetched.
- An Attendance row is inserted for each member: `Status = "pending"`.
- Creator gets `Status = "going"`.

When created without a `GroupId`:
- Only the creator gets an Attendance row (`Status = "going"`).

## Files Modified

- `backend/Endpoints/MeatupEndpoints.cs`
- `backend/Endpoints/ReviewEndpoints.cs`
- `backend/DTOs/MeatupDtos.cs`
