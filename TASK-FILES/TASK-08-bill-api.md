---
status: complete
---

# TASK-08 · Bill & Payment API

Endpoints for recording the total bill for a meatup, computing the even split, and tracking who has paid.

## Goal

After each meatup the bill is entered once. The split is calculated evenly among all "going" attendees. Each attendee can be marked as paid. This powers the Bill/Split screen.

## Endpoints

### POST /api/meatups/{meatupId}/bill  *(requires JWT)*
Create the bill for a meatup. Only one bill per meatup (return 409 if one already exists).

**Request body:**
```json
{
  "totalAmount": 1284.50,
  "tipPercent": 22,
  "taxIncluded": true
}
```

**Behavior:**
- Count all `going` attendees for the meatup.
- Compute `splitAmount = totalAmount / attendeeCount` (round to 2 decimal places).
- Create one `Payment` row per `going` attendee with `paid = false`.
- Returns `201 Created`:
```json
{
  "id": 1,
  "meatupId": 1,
  "totalAmount": 1284.50,
  "tipPercent": 22,
  "taxIncluded": true,
  "splitAmount": 214.08,
  "attendeeCount": 6,
  "payments": [
    { "userId": 1, "displayName": "Katie", "role": "President", "paid": false }
  ]
}
```

### GET /api/meatups/{meatupId}/bill  *(requires JWT)*
Returns the bill for a meatup including payment statuses. Returns 404 if no bill exists yet.

### PATCH /api/meatups/{meatupId}/bill/payments/{userId}  *(requires JWT)*
Toggle a user's payment status. Any authenticated user can mark any member as paid (for POC simplicity — in production this would be restricted).

**Request body:**
```json
{ "paid": true }
```
Returns `200 OK` with updated Payment record:
```json
{
  "userId": 4,
  "displayName": "Marcus",
  "paid": true,
  "paidAt": "2026-05-16T12:00:00Z"
}
```

### PUT /api/meatups/{meatupId}/bill  *(requires JWT)*
Update the bill total (recalculates split amount). Only allowed if no one has paid yet, to avoid confusion.

## Implementation Steps

1. Create `backend/Endpoints/BillEndpoints.cs`.
2. Create `BillDto`, `PaymentDto`, `CreateBillRequest`, `UpdatePaymentRequest` DTOs.
3. In the POST handler, query attendee count and generate Payment rows in a single transaction.
4. `splitAmount` calculation: `Math.Round(totalAmount / attendeeCount, 2, MidpointRounding.AwayFromZero)`.

## Notes

- The Bill/Split screen in the UI shows the `splitAmount`, the total, and a list of all attendees with PAID/PENDING badges.
- The `totalSpend` stat in TASK-07 sums `splitAmount` from bills for meatups the user attended.

## Acceptance Criteria

- [ ] `POST /api/meatups/{id}/bill` creates the bill and auto-creates Payment rows for all going attendees.
- [ ] Creating a second bill for the same meatup returns 409.
- [ ] `GET /api/meatups/{id}/bill` returns bill with all payment statuses.
- [ ] `PATCH .../payments/{userId}` updates a single payment record.
- [ ] `splitAmount` is correctly computed as `totalAmount / attendeeCount`.
