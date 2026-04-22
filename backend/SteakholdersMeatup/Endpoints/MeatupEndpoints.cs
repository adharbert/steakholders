using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Endpoints;

public static class MeatupEndpoints
{
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
            if (string.IsNullOrWhiteSpace(req.RestaurantName))
                return Results.BadRequest(new { error = "Restaurant name is required." });
            if (string.IsNullOrWhiteSpace(req.Location))
                return Results.BadRequest(new { error = "Location is required." });

            var userId = GetUserId(principal);
            var meatup = new Meatup
            {
                RestaurantName = req.RestaurantName,
                Location = req.Location,
                EventDate = req.EventDate.ToUniversalTime(),
                Notes = req.Notes,
                CreatedByUserId = userId
            };
            db.Meatups.Add(meatup);
            await db.SaveChangesAsync();

            db.Attendances.Add(new Attendance { MeatupId = meatup.Id, UserId = userId, Status = "going" });
            await db.SaveChangesAsync();

            await db.Entry(meatup).Reference(m => m.CreatedBy).LoadAsync();
            await db.Entry(meatup).Collection(m => m.Attendances).Query().Include(a => a.User).LoadAsync();

            return Results.Created($"/api/meatups/{meatup.Id}", ToSummary(meatup, userId));
        }).RequireAuthorization();

        app.MapPut("/api/meatups/{id:int}", async (int id, UpdateMeatupRequest req, AppDbContext db, ClaimsPrincipal principal) =>
        {
            var userId = GetUserId(principal);
            var meatup = await db.Meatups.FindAsync(id);
            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });
            if (meatup.CreatedByUserId != userId) return Results.Forbid();

            meatup.RestaurantName = req.RestaurantName;
            meatup.Location = req.Location;
            meatup.EventDate = req.EventDate.ToUniversalTime();
            meatup.Notes = req.Notes;
            await db.SaveChangesAsync();

            await db.Entry(meatup).Reference(m => m.CreatedBy).LoadAsync();
            await db.Entry(meatup).Collection(m => m.Attendances).Query().Include(a => a.User).LoadAsync();
            await db.Entry(meatup).Collection(m => m.Orders).Query().Include(o => o.Review).LoadAsync();

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

    private static MeatupSummaryDto ToSummary(Meatup m, int userId)
    {
        var goingCount = m.Attendances.Count(a => a.Status == "going");
        var myStatus = m.Attendances.FirstOrDefault(a => a.UserId == userId)?.Status;
        var scores = m.Orders.Where(o => o.Review is not null).Select(o => (double)o.Review!.OverallScore).ToList();
        double? avg = scores.Count > 0 ? Math.Round(scores.Average(), 1) : null;

        return new MeatupSummaryDto(
            m.Id, m.RestaurantName, m.Location, m.EventDate,
            goingCount, myStatus, avg,
            new UserDto(m.CreatedBy.Id, m.CreatedBy.Username, m.CreatedBy.DisplayName, m.CreatedBy.Role)
        );
    }

    private static MeatupDetailDto ToDetail(Meatup m, int userId)
    {
        var attendees = m.Attendances
            .Select(a => new AttendeeDto(a.UserId, a.User.DisplayName, a.User.Role, a.Status))
            .ToList();

        var reviews = m.Orders
            .Where(o => o.Review is not null)
            .Select(o => new ReviewDetailDto(
                o.Review!.Id, m.Id, m.RestaurantName, m.EventDate,
                o.UserId, o.User.DisplayName, o.CutName, o.WeightOz,
                o.Review.OverallScore, o.Review.DonenessRating, o.Review.FlavorRating,
                o.Review.TendernessRating, o.Review.ValueRating, o.Review.Notes, o.Review.CreatedAt
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

        return new MeatupDetailDto(m.Id, m.RestaurantName, m.Location, m.EventDate, m.Notes, attendees, reviews, billDto);
    }
}
