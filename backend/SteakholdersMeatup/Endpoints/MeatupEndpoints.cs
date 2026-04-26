using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Endpoints;

public static class MeatupEndpoints
{
    private static readonly string[] ValidVenueTypes = ["restaurant", "home", "park", "other"];

    public static void MapMeatupEndpoints(this WebApplication app)
    {
        app.MapGet("/api/meatups", async (
            AppDbContext db,
            ClaimsPrincipal principal,
            bool? upcoming,
            bool? past) =>
        {
            var userId = GetUserId(principal);
            var now = DateTime.UtcNow;

            var query = db.Meatups
                .Include(m => m.CreatedBy)
                .Include(m => m.Group)
                .Include(m => m.Restaurant)
                .Include(m => m.Attendances).ThenInclude(a => a.User)
                .Include(m => m.Orders).ThenInclude(o => o.Review)
                .AsQueryable();

            if (upcoming == true) query = query.Where(m => m.EventDate > now);
            if (past == true)     query = query.Where(m => m.EventDate <= now);

            var meatups = await query.OrderByDescending(m => m.EventDate).ToListAsync();

            return Results.Ok(meatups.Select(m => ToSummary(m, userId)));
        }).RequireAuthorization();

        app.MapGet("/api/meatups/{id:int}", async (int id, AppDbContext db, ClaimsPrincipal principal) =>
        {
            var userId = GetUserId(principal);
            var m = await db.Meatups
                .Include(m => m.CreatedBy)
                .Include(m => m.Group)
                .Include(m => m.Restaurant)
                .Include(m => m.Attendances).ThenInclude(a => a.User)
                .Include(m => m.Orders).ThenInclude(o => o.User)
                .Include(m => m.Orders).ThenInclude(o => o.Review)
                .Include(m => m.Bill).ThenInclude(b => b!.Payments).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (m is null) return Results.NotFound(new { error = "Meatup not found." });
            return Results.Ok(ToDetail(m, userId));
        }).RequireAuthorization();

        app.MapPost("/api/meatups", async (CreateMeatupRequest req, AppDbContext db, ClaimsPrincipal principal) =>
        {
            if (!ValidVenueTypes.Contains(req.VenueType))
                return Results.BadRequest(new { error = "VenueType must be restaurant, home, park, or other." });

            if (req.VenueType == "restaurant" && req.RestaurantId is null)
                return Results.BadRequest(new { error = "RestaurantId is required for restaurant events." });

            if (req.VenueType != "restaurant" && string.IsNullOrWhiteSpace(req.VenueName))
                return Results.BadRequest(new { error = "VenueName is required for non-restaurant events." });

            var userId = GetUserId(principal);

            // Validate group membership if a group is specified
            if (req.GroupId.HasValue)
            {
                var isMember = await db.GroupMemberships.AnyAsync(m =>
                    m.GroupId == req.GroupId && m.UserId == userId && m.Status == "active");
                if (!isMember)
                    return Results.Forbid();
            }

            var meatup = new Meatup
            {
                VenueType = req.VenueType,
                GroupId = req.GroupId,
                RestaurantId = req.RestaurantId,
                VenueName = req.VenueName,
                VenueStreet1 = req.VenueStreet1,
                VenueCity = req.VenueCity,
                VenueState = req.VenueState,
                VenueZip = req.VenueZip,
                VenueCountry = req.VenueCountry,
                EventDate = req.EventDate.ToUniversalTime(),
                Notes = req.Notes,
                CreatedByUserId = userId
            };
            db.Meatups.Add(meatup);
            await db.SaveChangesAsync();

            // Auto-RSVP all active group members with "pending" status
            if (req.GroupId.HasValue)
            {
                var memberIds = await db.GroupMemberships
                    .Where(m => m.GroupId == req.GroupId && m.Status == "active")
                    .Select(m => m.UserId)
                    .ToListAsync();

                foreach (var memberId in memberIds)
                {
                    var status = memberId == userId ? "going" : "pending";
                    db.Attendances.Add(new Attendance { MeatupId = meatup.Id, UserId = memberId, Status = status });
                }
            }
            else
            {
                db.Attendances.Add(new Attendance { MeatupId = meatup.Id, UserId = userId, Status = "going" });
            }
            await db.SaveChangesAsync();

            await db.Entry(meatup).Reference(m => m.CreatedBy).LoadAsync();
            await db.Entry(meatup).Reference(m => m.Group).LoadAsync();
            await db.Entry(meatup).Reference(m => m.Restaurant).LoadAsync();
            await db.Entry(meatup).Collection(m => m.Attendances).Query().Include(a => a.User).LoadAsync();

            return Results.Created($"/api/meatups/{meatup.Id}", ToSummary(meatup, userId));
        }).RequireAuthorization();

        app.MapPut("/api/meatups/{id:int}", async (int id, UpdateMeatupRequest req, AppDbContext db, ClaimsPrincipal principal) =>
        {
            if (!ValidVenueTypes.Contains(req.VenueType))
                return Results.BadRequest(new { error = "VenueType must be restaurant, home, park, or other." });

            var userId = GetUserId(principal);
            var meatup = await db.Meatups
                .Include(m => m.CreatedBy)
                .Include(m => m.Group)
                .Include(m => m.Restaurant)
                .Include(m => m.Attendances).ThenInclude(a => a.User)
                .Include(m => m.Orders).ThenInclude(o => o.Review)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });
            if (meatup.CreatedByUserId != userId) return Results.Forbid();

            meatup.VenueType = req.VenueType;
            meatup.GroupId = req.GroupId;
            meatup.RestaurantId = req.RestaurantId;
            meatup.VenueName = req.VenueName;
            meatup.VenueStreet1 = req.VenueStreet1;
            meatup.VenueCity = req.VenueCity;
            meatup.VenueState = req.VenueState;
            meatup.VenueZip = req.VenueZip;
            meatup.VenueCountry = req.VenueCountry;
            meatup.EventDate = req.EventDate.ToUniversalTime();
            meatup.Notes = req.Notes;
            await db.SaveChangesAsync();

            return Results.Ok(ToSummary(meatup, userId));
        }).RequireAuthorization();

        app.MapDelete("/api/meatups/{id:int}", async (int id, AppDbContext db, ClaimsPrincipal principal) =>
        {
            var userId = GetUserId(principal);
            var meatup = await db.Meatups.FindAsync(id);
            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });
            if (meatup.CreatedByUserId != userId) return Results.Forbid();

            db.Meatups.Remove(meatup);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapPost("/api/meatups/{id:int}/rsvp", async (int id, RsvpRequest req, AppDbContext db, ClaimsPrincipal principal) =>
        {
            if (!new[] { "going", "maybe", "not_going" }.Contains(req.Status))
                return Results.BadRequest(new { error = "Status must be going, maybe, or not_going." });

            var userId = GetUserId(principal);
            var meatup = await db.Meatups.FindAsync(id);
            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });

            var existing = await db.Attendances.FirstOrDefaultAsync(a => a.MeatupId == id && a.UserId == userId);
            if (existing is not null)
            {
                existing.Status = req.Status;
                existing.RespondedAt = DateTime.UtcNow;
            }
            else
            {
                db.Attendances.Add(new Attendance { MeatupId = id, UserId = userId, Status = req.Status });
            }
            await db.SaveChangesAsync();

            var att = await db.Attendances.FirstAsync(a => a.MeatupId == id && a.UserId == userId);
            return Results.Ok(new RsvpResponse(id, userId, att.Status, att.RespondedAt));
        }).RequireAuthorization();

        app.MapDelete("/api/meatups/{id:int}/rsvp", async (int id, AppDbContext db, ClaimsPrincipal principal) =>
        {
            var userId = GetUserId(principal);
            var att = await db.Attendances.FirstOrDefaultAsync(a => a.MeatupId == id && a.UserId == userId);
            if (att is null) return Results.NoContent();
            db.Attendances.Remove(att);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapGet("/api/meatups/{id:int}/attendees", async (int id, AppDbContext db) =>
        {
            var meatup = await db.Meatups.FindAsync(id);
            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });

            var attendees = await db.Attendances
                .Include(a => a.User)
                .Where(a => a.MeatupId == id)
                .Select(a => new AttendeeDto(a.UserId, a.User.DisplayName, a.User.Role, a.Status))
                .ToListAsync();

            return Results.Ok(attendees);
        }).RequireAuthorization();
    }

    private static int GetUserId(ClaimsPrincipal p) =>
        int.Parse(p.FindFirstValue(ClaimTypes.NameIdentifier) ?? p.FindFirstValue("sub") ?? "0");

    private static (string Name, string Location) GetVenueDisplay(Meatup m)
    {
        if (m.VenueType == "restaurant" && m.Restaurant is not null)
            return (m.Restaurant.Name, $"{m.Restaurant.City}, {m.Restaurant.State}");

        if (m.VenueType == "restaurant" && !string.IsNullOrWhiteSpace(m.RestaurantName))
            return (m.RestaurantName, m.Location ?? "");

        var venueName = m.VenueName ?? m.VenueType switch
        {
            "home" => "Home Event",
            "park" => "Park Event",
            _ => "Event"
        };

        var location = string.Join(", ", new[] { m.VenueCity, m.VenueState }.Where(s => !string.IsNullOrWhiteSpace(s)));
        return (venueName, location);
    }

    private static MeatupSummaryDto ToSummary(Meatup m, int userId)
    {
        var goingCount = m.Attendances.Count(a => a.Status == "going");
        var myStatus = m.Attendances.FirstOrDefault(a => a.UserId == userId)?.Status;
        var scores = m.Orders.Where(o => o.Review is not null).Select(o => (double)o.Review!.OverallScore).ToList();
        double? avg = scores.Count > 0 ? Math.Round(scores.Average(), 1) : null;
        var (name, location) = GetVenueDisplay(m);

        return new MeatupSummaryDto(
            m.Id, m.VenueType, name, location, m.EventDate,
            goingCount, myStatus, avg,
            new UserDto(m.CreatedBy.Id, m.CreatedBy.Username, m.CreatedBy.DisplayName, m.CreatedBy.Role),
            m.GroupId, m.Group?.Name
        );
    }

    private static MeatupDetailDto ToDetail(Meatup m, int userId)
    {
        var attendees = m.Attendances
            .Select(a => new AttendeeDto(a.UserId, a.User.DisplayName, a.User.Role, a.Status))
            .ToList();

        var (name, location) = GetVenueDisplay(m);

        var reviews = m.Orders
            .Where(o => o.Review is not null)
            .Select(o => new ReviewDetailDto(
                o.Review!.Id, m.Id, name, m.EventDate,
                o.UserId, o.User.DisplayName, o.CutName, o.WeightOz, o.Temperature,
                o.Review.OverallScore, o.Review.ServiceRating, o.Review.AmbianceRating,
                o.Review.FoodQualityRating, o.Review.TasteRating, o.Review.Notes, o.Review.CreatedAt
            )).ToList();

        BillDto? billDto = null;
        if (m.Bill is not null)
        {
            var payments = m.Bill.Payments
                .Select(p => new PaymentDto(p.UserId, p.User.DisplayName, p.User.Role, p.Paid, p.PaidAt))
                .ToList();
            billDto = new BillDto(m.Bill.Id, m.Id, m.Bill.TotalAmount, m.Bill.TipPercent,
                m.Bill.TaxIncluded, m.Bill.SplitAmount, payments.Count, payments);
        }

        return new MeatupDetailDto(m.Id, m.VenueType, name, location, m.EventDate, m.Notes,
            m.GroupId, m.Group?.Name, m.RestaurantId, attendees, reviews, billDto);
    }
}
