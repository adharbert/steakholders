---
status: complete
---

# TASK-21 · User Model – Email & OAuth Provider Support

Extend the `Users` table and EF model to support email/password accounts and OAuth-linked accounts (Google, Facebook).

## Goal

The current schema stores only `Username` + `PasswordHash`. We need to accommodate three new registration paths:

1. **Email + password** — user provides email, username, password.
2. **Google OAuth** — account created from Google profile; no local password.
3. **Facebook OAuth** — account created from Facebook profile; no local password.

A single user record must be able to represent any of these, and a local-password user can later link a social provider.

## Schema Changes to `Users`

| New Column | Type | Notes |
|---|---|---|
| Email | string? | Nullable — email-based and OAuth users will have this; username-only POC users may not. Unique where non-null. |
| PasswordHash | string? | **Make nullable** — OAuth-only users have no local password. Existing rows keep their hash. |
| AuthProvider | string? | `null` or `"local"` for email/password accounts; `"google"` or `"facebook"` for social accounts. |
| ProviderUserId | string? | The external provider's user ID (e.g. Google `sub`, Facebook `id`). Unique where non-null. |

Unique constraints:
- `Email` — enforce at the DB level with a partial/filtered unique index (exclude nulls).
- `(AuthProvider, ProviderUserId)` — composite unique index to prevent duplicate OAuth accounts per provider.

## Implementation Steps

1. Update `backend/Models/User.cs`:
   - Add `Email`, `AuthProvider`, `ProviderUserId` as nullable `string?` properties.
   - Change `PasswordHash` from `string` to `string?`.
2. Update `backend/Data/AppDbContext.cs` Fluent API config:
   - Add `HasIndex(u => u.Email).IsUnique().HasFilter("[Email] IS NOT NULL")`.
   - Add `HasIndex(u => new { u.AuthProvider, u.ProviderUserId }).IsUnique().HasFilter("[ProviderUserId] IS NOT NULL")`.
3. Create and apply a new EF migration:
   ```
   dotnet ef migrations add AddEmailAndOAuthProvider
   dotnet ef database update
   ```
4. Update seed data in `SeedData` so existing dev users get `AuthProvider = "local"` and keep their hashes (email can be null for seed users).

## Acceptance Criteria

- [ ] `Users` table has `Email`, `AuthProvider`, `ProviderUserId` columns after migration.
- [ ] `PasswordHash` column is nullable in the DB (existing rows unaffected).
- [ ] Unique index on `Email` (excluding nulls) is present.
- [ ] Composite unique index on `(AuthProvider, ProviderUserId)` (excluding null `ProviderUserId`) is present.
- [ ] Existing seed/dev users still load and log in after migration.
