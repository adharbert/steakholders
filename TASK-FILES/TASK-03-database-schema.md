---
status: complete
---

# TASK-03 · Database Schema & EF Migrations

Design and implement the SQLite schema via Entity Framework Core.

## Goal

Create all EF Core model classes, configure `AppDbContext`, and run the initial migration to produce the SQLite database.

## Data Models

### Users
| Column | Type | Notes |
|---|---|---|
| Id | int PK | auto-increment |
| Username | string | unique, max 50 chars |
| PasswordHash | string? | bcrypt hash; null for OAuth-only users |
| DisplayName | string | shown in UI, e.g. "Katie" |
| Role | string | e.g. "President", "Founder", "Treasurer", "Grill Master", "Notes Keeper", "Sommelier", "Member" |
| CreatedAt | DateTime | UTC |
| Email | string? | unique (where non-null); used for email/password and OAuth accounts |
| AuthProvider | string? | null or "local" for email/password; "google" or "facebook" for social accounts |
| ProviderUserId | string? | external provider user ID; composite unique with AuthProvider (where non-null) |

### Meatups
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| RestaurantName | string | e.g. "Bern's Steak House" |
| Location | string | e.g. "Tampa, Florida" |
| EventDate | DateTime | UTC |
| Notes | string? | optional organizer notes |
| CreatedByUserId | int FK → Users | |
| CreatedAt | DateTime | |

### Attendances (RSVPs)
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| MeatupId | int FK → Meatups | |
| UserId | int FK → Users | |
| Status | string | "going" \| "maybe" \| "not_going" |
| RespondedAt | DateTime | |

Unique constraint on `(MeatupId, UserId)`.

### Orders
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| MeatupId | int FK → Meatups | |
| UserId | int FK → Users | |
| CutName | string | e.g. "Dry-Aged Ribeye" |
| WeightOz | int? | e.g. 22 |
| Temperature | string? | e.g. "rare", "medium-rare", "medium", "medium-well", "well-done" |
| CreatedAt | DateTime | |

### Reviews
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| OrderId | int FK → Orders | unique (one review per order) |
| ServiceRating | int | 1–5 |
| AmbianceRating | int | 1–5 |
| FoodQualityRating | int | 1–5 |
| TasteRating | int | 1–5 |
| OverallScore | float | computed: avg of the four ratings |
| Notes | string? | tasting notes |
| CreatedAt | DateTime | |

### Bills
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| MeatupId | int FK → Meatups | unique (one bill per meatup) |
| TotalAmount | decimal | e.g. 1284.50 |
| TipPercent | int | e.g. 22 |
| TaxIncluded | bool | |
| SplitAmount | decimal | computed: TotalAmount / attendee count |
| CreatedAt | DateTime | |

### Payments
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| BillId | int FK → Bills | |
| UserId | int FK → Users | |
| Paid | bool | default false |
| PaidAt | DateTime? | |

Unique constraint on `(BillId, UserId)`.

## Implementation Steps

1. Create `backend/Models/` with one file per model: `User.cs`, `Meatup.cs`, `Attendance.cs`, `Order.cs`, `Review.cs`, `Bill.cs`, `Payment.cs`.
2. Create `backend/Data/AppDbContext.cs` with all `DbSet<T>` properties and Fluent API config (unique constraints, cascades).
3. Register `AppDbContext` in `Program.cs` using the SQLite connection string from config.
4. Run:
   ```
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
5. Seed a small dev dataset (2 users, 1 meatup, some reviews) via a `SeedData` static method called from `Program.cs` in Development only.

## Acceptance Criteria

- [ ] `steakholders.db` is created with all tables after `dotnet ef database update`.
- [ ] Seed data is visible when querying the database in dev mode.
- [ ] All FK relationships and unique constraints are enforced at the DB level.
