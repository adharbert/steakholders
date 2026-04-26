---
status: complete
---

# TASK-24 · Groups API

Backend endpoints for group management: create, search, join, member approval.

## Goal

All users must belong to at least one group to participate in meatups. Groups can be private (invite-code only) or public (searchable, leader approves join requests). Leaders can approve/reject pending members.

## Endpoints

### Create Group
`POST /api/groups` — auth required

Request:
```json
{ "name": "Tampa Steakholders", "description": "...", "isPrivate": false, "zipCode": "33602" }
```
- Geocodes ZipCode via Nominatim to populate Latitude/Longitude.
- Generates a unique 8-char alphanumeric `InviteCode`.
- Auto-creates an `active` GroupMembership for the creator (becomes leader).

Response: `GroupDto`

---

### My Groups
`GET /api/groups/my` — auth required

Returns all groups where the current user has `Status = "active"`.

---

### Search Public Groups
`GET /api/groups/search?zip=33602` — public

Returns non-private groups. Distance calculation uses Haversine when both group and search have geocoded coordinates.

---

### Group Detail
`GET /api/groups/{id}` — auth required

Private groups: only visible to active members. Public groups: visible to all logged-in users.

---

### Join Group
`POST /api/groups/{id}/join` — auth required

Request:
```json
{ "inviteCode": "STEAK001" }
```
- If `InviteCode` matches → Status = `"active"` (auto-approve, works for both private and public groups).
- If no code or wrong code → Status = `"pending"` (leader must approve).

---

### List Members
`GET /api/groups/{id}/members` — auth required (active members only)

Returns all memberships (pending + active + rejected).

---

### Approve / Reject Member
`PUT /api/groups/{id}/members/{memberId}` — auth required (leader only)

Request: `{ "status": "active" }` or `{ "status": "rejected" }`

---

### Remove Member
`DELETE /api/groups/{id}/members/{memberId}` — auth required (leader only)

## DTOs

```csharp
record CreateGroupRequest(string Name, string? Description, bool IsPrivate, string ZipCode);
record GroupDto(int Id, string Name, string? Description, bool IsPrivate, string InviteCode,
    string ZipCode, int LeaderUserId, string LeaderDisplayName, DateTime CreatedAt, int MemberCount);
record GroupSummaryDto(int Id, string Name, bool IsPrivate, string ZipCode, int MemberCount, double? DistanceMiles);
record JoinGroupRequest(string? InviteCode);
record GroupMembershipDto(int UserId, string DisplayName, string Role, string Status, DateTime RequestedAt);
record ApproveRejectRequest(string Status);
```

## File

`backend/Endpoints/GroupEndpoints.cs`

## Services Used

- `GeocodingService.ZipToCoordinatesAsync()` — Nominatim geocoding on group creation
- `GeocodingService.DistanceMiles()` — static Haversine distance for search results
