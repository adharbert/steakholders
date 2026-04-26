---
status: complete
---

# TASK-27 · Group Screens

Three screens for group management: create, join, and view a group.

## CreateGroupScreen

**Route:** `/groups/new` (protected)

**File:** `frontend/src/screens/CreateGroupScreen.jsx`

**Fields:**
- Group Name — required
- Description — optional textarea
- Zip Code — required
- Private group toggle — checkbox; hint text explains invite-code-only vs. public + leader-approval

**Behavior:** `POST /api/groups` → navigates to `/groups/{id}` on success.

---

## JoinGroupScreen

**Route:** `/groups/join` (protected)

**File:** `frontend/src/screens/JoinGroupScreen.jsx`

**Layout:**
```
[Have an Invite Code?]
  [code input] [Join button]

[— or search —]

[Zip Code search input] [Search button]
  → result list: group name, member count, zip, [Request] button

[— — —]
[Start your own group →]
```

**Behavior:**
- Invite code → `POST /api/groups/{id}/join` with `{ inviteCode }` → auto-approved if code matches.
- Search → `GET /api/groups/search?zip=` → lists public groups → Request button sends join request.
- Success message varies: "Joined!" vs "Request sent — awaiting leader approval."
- On success → navigates to `/home`.

---

## GroupScreen

**Route:** `/groups/:id` (protected)

**File:** `frontend/src/screens/GroupScreen.jsx`

**Layout:**
```
[Group name + private shield icon]
[Description]

[IF leader: invite code box — tap to copy]

[IF leader AND pending members exist: "Pending Requests" section]
  member row + [Approve] [Reject] buttons

["Members (N)" section]
  member rows: avatar, display name, role, "Leader" badge for leader
```

**Behavior:**
- Loads `GET /api/groups/{id}` + `GET /api/groups/{id}/members`.
- Approve/reject calls `PUT /api/groups/{id}/members/{userId}`.
- Invite code box copies to clipboard on click.
- Only leader sees pending requests section and invite code.

## Nav Integration

Groups tab added to `NavBar` in `App.jsx` (links to `/groups/join`).

Tab is active when pathname starts with `/groups`.

## API Dependencies

- `api/groups.js` — `getMyGroups`, `getGroup`, `createGroup`, `searchGroups`, `joinGroup`, `getGroupMembers`, `approveMember`, `rejectMember`
