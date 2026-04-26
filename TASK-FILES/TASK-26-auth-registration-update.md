---
status: complete
---

# TASK-26 · Auth Registration Update

Add ZipCode (required), Email (optional), and InviteCode (optional) to registration. Auto-join group on valid invite code.

## Goal

Registration now collects a user's zip code for location-based features (nearby restaurant search, group discovery). An optional invite code lets new users auto-join a private or public group immediately on signup.

## Backend Changes

### `POST /api/auth/register`

Updated `RegisterRequest`:
```csharp
record RegisterRequest(
    string Username,
    string Password,
    string DisplayName,
    string ZipCode,
    string? Email = null,
    string? InviteCode = null
);
```

Behavior:
1. Validate ZipCode present.
2. Geocode ZipCode via `GeocodingService.ZipToCoordinatesAsync()` → store Latitude/Longitude on User.
3. Create user with `ZipCode`, `Email`, `Latitude`, `Longitude`.
4. If `InviteCode` provided, look up matching Group → create `active` GroupMembership immediately.

## Frontend Changes

### `RegisterScreen.jsx`

New fields added to the form:
- **Zip Code** — required, numeric input, positioned after Display Name
- **Email** — optional, email input
- **Group Invite Code** — optional, auto-uppercased, hint: "Have a code? You'll be auto-joined to that group."

Field ordering:
1. Display Name
2. Username
3. Zip Code *(required)*
4. Email *(optional)*
5. Password
6. Confirm Password
7. Group Invite Code *(optional)*

Client-side validation added: zip code must not be empty.

## Files Modified

- `backend/Endpoints/AuthEndpoints.cs`
- `backend/DTOs/AuthDtos.cs`
- `frontend/src/screens/RegisterScreen.jsx`
