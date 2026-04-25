---
status: complete
---

# TASK-07 · Orders & Reviews API

Endpoints for logging what each person ordered and submitting steak reviews.

## Goal

After a meatup, each attendee records the cut they ordered and submits a review with four star ratings plus tasting notes. This feeds the Archive and the Home screen's Recent Reviews section.

## Endpoints

### POST /api/meatups/{meatupId}/orders  *(requires JWT)*
Submit or update the calling user's order for a meatup. Upsert by `(meatupId, userId)`.

**Request body:**
```json
{
  "cutName": "Dry-Aged Ribeye",
  "weightOz": 22,
  "temperature": "medium-rare"
}
```
- `temperature` is optional. Accepted values: `"rare"`, `"medium-rare"`, `"medium"`, `"medium-well"`, `"well-done"`.

Returns `201 Created` (or `200 OK` on update) with:
```json
{
  "id": 5,
  "meatupId": 1,
  "userId": 1,
  "cutName": "Dry-Aged Ribeye",
  "weightOz": 22,
  "temperature": "medium-rare",
  "hasReview": false
}
```

### GET /api/meatups/{meatupId}/orders  *(requires JWT)*
Returns all orders for a meatup.

### POST /api/orders/{orderId}/review  *(requires JWT, order owner only)*
Submit or update a review for the calling user's order. One review per order.

**Request body:**
```json
{
  "serviceRating": 5,
  "ambianceRating": 4,
  "foodQualityRating": 5,
  "tasteRating": 4,
  "notes": "Crust was mesmerizing, interior a touch past medium-rare but forgivable at this marbling."
}
```

- Validate all ratings are 1–5.
- Compute `overallScore = (serviceRating + ambianceRating + foodQualityRating + tasteRating) / 4.0`, rounded to 1 decimal.
- Returns `201 Created` (or `200 OK` on update) with the full review object.

### GET /api/reviews  *(requires JWT)*
Returns a paginated list of all reviews across all meatups. Used for the Archive and Recent Reviews section.

Query params:
- `?limit=20&offset=0` — pagination
- `?userId=1` — filter by user
- `?meatupId=1` — filter by meatup

**Response `200 OK`:**
```json
{
  "total": 47,
  "reviews": [
    {
      "id": 1,
      "meatupId": 1,
      "restaurantName": "Bern's Steak House",
      "eventDate": "2026-05-15T23:30:00Z",
      "userId": 2,
      "displayName": "Andy",
      "cutName": "Dry-Aged Ribeye",
      "weightOz": 22,
      "temperature": "medium-rare",
      "overallScore": 4.5,
      "serviceRating": 5,
      "ambianceRating": 4,
      "foodQualityRating": 5,
      "tasteRating": 4,
      "notes": "Crust was mesmerizing...",
      "createdAt": "2026-05-16T01:00:00Z"
    }
  ]
}
```

### GET /api/users/me/stats  *(requires JWT)*
Returns the calling user's summary stats for the Home screen "Ledger" section.

**Response `200 OK`:**
```json
{
  "meatupCount": 14,
  "averageScore": 4.2,
  "totalSpend": 847.00
}
```
- `totalSpend` = sum of `SplitAmount` from Bills for meatups the user attended with `paid = true` or simply attended (for POC, sum all split amounts for meatups they attended where a bill exists).

## Implementation Steps

1. Create `backend/Endpoints/OrderEndpoints.cs` and `backend/Endpoints/ReviewEndpoints.cs`.
2. Create corresponding DTOs.
3. Enforce order ownership on the review POST (check `order.UserId == callerUserId`).
4. The `GET /api/reviews` query should JOIN Orders → Meatups → Users and Reviews for the full response shape.

## Acceptance Criteria

- [ ] `POST /api/meatups/{id}/orders` creates an order; re-posting updates it.
- [ ] `POST /api/orders/{id}/review` creates a review; re-posting updates it.
- [ ] Attempting to review another user's order returns 403.
- [ ] `GET /api/reviews` supports pagination and all filter params.
- [ ] `GET /api/users/me/stats` returns correct meatup count, avg score, and total spend.
- [ ] Overall score is correctly computed as the average of service, ambiance, food quality, and taste ratings.
- [ ] Order records `cutName`, optional `weightOz`, and optional `temperature`.
- [ ] `temperature` values are validated against the accepted list (rare, medium-rare, medium, medium-well, well-done).
