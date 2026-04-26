---
status: complete
---

# TASK-03 · Database Schema & EF Migrations

Design and implement the SQLite schema via Entity Framework Core.

## Goal

Create all EF Core model classes, configure `AppDbContext`, and run the migration to produce the SQLite database. Supports multi-group membership, structured restaurant records, venue types, auto-RSVP, and user location.

## Data Models

### Users
| Column | Type | Notes |
|---|---|---|
| Id | int PK | auto-increment |
| Username | string | unique, max 50 chars |
| PasswordHash | string? | bcrypt hash; null for OAuth-only users |
| DisplayName | string | shown in UI, e.g. "Katie" |
| Role | string | e.g. "President", "Founder", "Member" |
| CreatedAt | DateTime | UTC |
| Email | string? | unique (where non-null) |
| AuthProvider | string? | null / "google" / "facebook" |
| ProviderUserId | string? | composite unique with AuthProvider |
| ZipCode | string | **required**; used for location-based features |
| Street1 | string? | optional full address |
| City | string? | |
| State | string? | |
| Country | string? | |
| Latitude | double? | geocoded from ZipCode via Nominatim |
| Longitude | double? | |

### Groups
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| Name | string | |
| Description | string? | |
| IsPrivate | bool | private = invite-code only; public = leader approval |
| InviteCode | string | unique 8-char alphanumeric; always present |
| ZipCode | string | group's base location |
| Latitude | double? | geocoded |
| Longitude | double? | |
| LeaderUserId | int FK → Users | restrict delete |
| CreatedAt | DateTime | |

### GroupMemberships
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| GroupId | int FK → Groups | cascade delete |
| UserId | int FK → Users | cascade delete |
| Status | string | `"pending"` \| `"active"` \| `"rejected"` |
| RequestedAt | DateTime | |
| JoinedAt | DateTime? | set when Status → active |

Unique constraint on `(GroupId, UserId)`.

### Restaurants
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| Name | string | |
| Phone | string? | |
| Website | string? | |
| Street1 | string | |
| Street2 | string? | |
| City | string | |
| State | string | |
| Zip | string | |
| Country | string | default "US" |
| Latitude | double? | |
| Longitude | double? | |
| ExternalPlaceId | string? | Google Places ID; used to deduplicate imports |
| CreatedByUserId | int FK → Users | restrict delete |
| CreatedAt | DateTime | |

### Meatups
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| VenueType | string | `"restaurant"` \| `"home"` \| `"park"` \| `"other"` |
| GroupId | int? FK → Groups | nullable; set null on group delete |
| RestaurantId | int? FK → Restaurants | nullable; set null on restaurant delete |
| VenueName | string? | for non-restaurant venues |
| VenueStreet1 | string? | |
| VenueCity | string? | |
| VenueState | string? | |
| VenueZip | string? | |
| VenueCountry | string? | |
| VenueLatitude | double? | |
| VenueLongitude | double? | |
| RestaurantName | string? | legacy field kept nullable for migration compat |
| Location | string? | legacy field kept nullable |
| EventDate | DateTime | UTC |
| Notes | string? | |
| CreatedByUserId | int FK → Users | |
| CreatedAt | DateTime | |

### Attendances (RSVPs)
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| MeatupId | int FK → Meatups | |
| UserId | int FK → Users | |
| Status | string | `"going"` \| `"maybe"` \| `"not_going"` \| `"pending"` |
| RespondedAt | DateTime | |

Unique constraint on `(MeatupId, UserId)`.

When a meatup is created with a `GroupId`, all active group members are auto-inserted as Attendance rows with `Status = "pending"`. The creator gets `Status = "going"`.

### Orders
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| MeatupId | int FK → Meatups | |
| UserId | int FK → Users | |
| CutName | string | |
| WeightOz | int? | |
| Temperature | string? | rare / medium-rare / medium / medium-well / well-done |
| CreatedAt | DateTime | |

Orders and reviews are **only allowed** when `Meatup.VenueType == "restaurant"`.

### Reviews
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| OrderId | int FK → Orders | unique |
| ServiceRating | int | 1–5 |
| AmbianceRating | int | 1–5 |
| FoodQualityRating | int | 1–5 |
| TasteRating | int | 1–5 |
| OverallScore | float | avg of four ratings |
| Notes | string? | tasting notes |
| CreatedAt | DateTime | |

### ReviewPhotos
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| ReviewId | int FK → Reviews | cascade delete |
| FileName | string | stored under `wwwroot/uploads/{reviewId}/` |
| UploadedAt | DateTime | |

### RestaurantSummaries
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| RestaurantName | string | unique index |
| SummaryText | string | LLM-generated summary |
| ReviewCount | int | number of reviews used to generate it |
| GeneratedAt | DateTime | |

### Bills
| Column | Type | Notes |
|---|---|---|
| Id | int PK | |
| MeatupId | int FK → Meatups | unique |
| TotalAmount | decimal | |
| TipPercent | int | |
| TaxIncluded | bool | |
| SplitAmount | decimal | TotalAmount / attendee count |
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

## Key Constraints

- `Group.InviteCode` — unique index
- `GroupMembership (GroupId, UserId)` — unique
- `User.Username` — unique
- `User.Email` — unique (nullable-filtered)
- `User.(AuthProvider, ProviderUserId)` — unique (nullable-filtered)
- `Review.OrderId` — unique (one review per order)
- `Bill.MeatupId` — unique
- `Payment (BillId, UserId)` — unique
- `RestaurantSummary.RestaurantName` — unique
- `Attendance (MeatupId, UserId)` — unique

## Migration

Single `InitialSchema` migration created from scratch (EF Core 10 preview requires suppressing `PendingModelChangesWarning` via `OnConfiguring`). Database is recreated fresh in development; seed data populates all tables on first run.

## Seed Data (Development)

- 4 users: katie (President), andy (Founder), jordan (Treasurer), marcus (Grill Master)
- 1 group: "Steakholders" (public, leader = katie, invite code STEAK001)
- 4 active GroupMemberships
- 2 restaurants: Bern's Steak House (Tampa FL), Peter Luger (Brooklyn NY)
- 2 meatups: past (Bern's) + upcoming (Peter Luger), both linked to group
- Attendances, Orders, Reviews, Bill, Payments for past meatup

## Files

| File | Purpose |
|---|---|
| `backend/Models/User.cs` | User model with location fields |
| `backend/Models/Group.cs` | Group model |
| `backend/Models/GroupMembership.cs` | Membership join table |
| `backend/Models/Restaurant.cs` | Structured restaurant record |
| `backend/Models/Meatup.cs` | Event with VenueType + FK refs |
| `backend/Models/Attendance.cs` | RSVP record |
| `backend/Models/Order.cs` | Per-user order at meatup |
| `backend/Models/Review.cs` | Review linked to order |
| `backend/Models/ReviewPhoto.cs` | Photo uploaded to review |
| `backend/Models/RestaurantSummary.cs` | LLM-generated restaurant summary |
| `backend/Models/Bill.cs` | Split bill for meatup |
| `backend/Models/Payment.cs` | Individual payment status |
| `backend/Data/AppDbContext.cs` | EF Core context with all DbSets and Fluent API |
| `backend/Data/SeedData.cs` | Dev seed data |
| `backend/Migrations/` | Single `InitialSchema` migration |
