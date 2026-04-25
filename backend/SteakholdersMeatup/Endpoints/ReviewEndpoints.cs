using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this WebApplication app)
    {
        app.MapPost("/api/meatups/{meatupId:int}/orders", async (
            int meatupId,
            CreateOrderRequest req,
            AppDbContext db,
            ClaimsPrincipal principal) =>
        {
            if (string.IsNullOrWhiteSpace(req.CutName))
                return Results.BadRequest(new { error = "Cut name is required." });

            var userId = GetUserId(principal);
            var meatup = await db.Meatups.FindAsync(meatupId);
            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });

            var existing = await db.Orders.Include(o => o.Review).FirstOrDefaultAsync(o => o.MeatupId == meatupId && o.UserId == userId);
            if (existing is not null)
            {
                existing.CutName = req.CutName;
                existing.WeightOz = req.WeightOz;
                existing.Temperature = req.Temperature;
                await db.SaveChangesAsync();
                return Results.Ok(new OrderDto(existing.Id, meatupId, userId, existing.CutName, existing.WeightOz, existing.Temperature, existing.Review is not null));
            }

            var order = new Order { MeatupId = meatupId, UserId = userId, CutName = req.CutName, WeightOz = req.WeightOz, Temperature = req.Temperature };
            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return Results.Created($"/api/orders/{order.Id}", new OrderDto(order.Id, meatupId, userId, order.CutName, order.WeightOz, order.Temperature, false));
        }).RequireAuthorization();

        app.MapGet("/api/meatups/{meatupId:int}/orders", async (int meatupId, AppDbContext db) =>
        {
            var orders = await db.Orders.Include(o => o.Review).Where(o => o.MeatupId == meatupId).ToListAsync();
            return Results.Ok(orders.Select(o => new OrderDto(o.Id, meatupId, o.UserId, o.CutName, o.WeightOz, o.Temperature, o.Review is not null)));
        }).RequireAuthorization();

        app.MapPost("/api/orders/{orderId:int}/review", async (
            int orderId,
            SubmitReviewRequest req,
            AppDbContext db,
            ClaimsPrincipal principal) =>
        {
            if (req.ServiceRating < 1 || req.ServiceRating > 5 ||
                req.AmbianceRating < 1 || req.AmbianceRating > 5 ||
                req.FoodQualityRating < 1 || req.FoodQualityRating > 5 ||
                req.TasteRating < 1 || req.TasteRating > 5)
                return Results.BadRequest(new { error = "All ratings must be between 1 and 5." });

            var userId = GetUserId(principal);
            var order = await db.Orders.Include(o => o.Review).Include(o => o.Meatup).Include(o => o.User).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order is null) return Results.NotFound(new { error = "Order not found." });
            if (order.UserId != userId) return Results.Forbid();

            var overall = (float)Math.Round((req.ServiceRating + req.AmbianceRating + req.FoodQualityRating + req.TasteRating) / 4.0, 1);

            if (order.Review is not null)
            {
                order.Review.ServiceRating = req.ServiceRating;
                order.Review.AmbianceRating = req.AmbianceRating;
                order.Review.FoodQualityRating = req.FoodQualityRating;
                order.Review.TasteRating = req.TasteRating;
                order.Review.OverallScore = overall;
                order.Review.Notes = req.Notes;
                await db.SaveChangesAsync();
                return Results.Ok(ToReviewDto(order.Review, order));
            }

            var review = new Review
            {
                OrderId = orderId,
                ServiceRating = req.ServiceRating,
                AmbianceRating = req.AmbianceRating,
                FoodQualityRating = req.FoodQualityRating,
                TasteRating = req.TasteRating,
                OverallScore = overall,
                Notes = req.Notes
            };
            db.Reviews.Add(review);
            await db.SaveChangesAsync();
            return Results.Created($"/api/reviews/{review.Id}", ToReviewDto(review, order));
        }).RequireAuthorization();

        app.MapGet("/api/reviews", async (
            AppDbContext db,
            int? limit,
            int? offset,
            int? userId,
            int? meatupId) =>
        {
            var query = db.Reviews
                .Include(r => r.Order).ThenInclude(o => o.User)
                .Include(r => r.Order).ThenInclude(o => o.Meatup)
                .AsQueryable();

            if (userId.HasValue) query = query.Where(r => r.Order.UserId == userId);
            if (meatupId.HasValue) query = query.Where(r => r.Order.MeatupId == meatupId);

            var total = await query.CountAsync();
            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip(offset ?? 0)
                .Take(limit ?? 20)
                .ToListAsync();

            var dtos = reviews.Select(r => ToReviewDto(r, r.Order)).ToList();
            return Results.Ok(new ReviewsResponse(total, dtos));
        }).RequireAuthorization();

        app.MapGet("/api/users/me/stats", async (AppDbContext db, ClaimsPrincipal principal) =>
        {
            var userId = GetUserId(principal);

            var meatupCount = await db.Attendances.CountAsync(a => a.UserId == userId && a.Status == "going");

            var scores = await db.Reviews
                .Where(r => r.Order.UserId == userId)
                .Select(r => (double)r.OverallScore)
                .ToListAsync();
            var avgScore = scores.Count > 0 ? Math.Round(scores.Average(), 1) : 0.0;

            var totalSpend = await db.Payments
                .Where(p => p.UserId == userId)
                .Include(p => p.Bill)
                .SumAsync(p => p.Bill.SplitAmount);

            return Results.Ok(new UserStatsDto(meatupCount, avgScore, totalSpend));
        }).RequireAuthorization();

        app.MapGet("/api/users/me/pending-reviews", async (AppDbContext db, ClaimsPrincipal principal) =>
        {
            var userId = GetUserId(principal);
            var meatupIds = await db.Attendances
                .Where(a => a.UserId == userId && a.Status == "going")
                .Select(a => a.MeatupId)
                .ToListAsync();

            var reviewedMeatupIds = await db.Orders
                .Where(o => o.UserId == userId && o.Review != null)
                .Select(o => o.MeatupId)
                .ToListAsync();

            var pendingIds = meatupIds.Except(reviewedMeatupIds).ToList();

            var meatups = await db.Meatups
                .Where(m => pendingIds.Contains(m.Id))
                .OrderByDescending(m => m.EventDate)
                .Select(m => new { m.Id, m.RestaurantName, m.Location, m.EventDate })
                .ToListAsync();

            return Results.Ok(meatups);
        }).RequireAuthorization();
    }

    private static int GetUserId(ClaimsPrincipal p) =>
        int.Parse(p.FindFirstValue(ClaimTypes.NameIdentifier) ?? p.FindFirstValue("sub") ?? "0");

    private static ReviewDetailDto ToReviewDto(Review r, Order o) => new(
        r.Id, o.MeatupId, o.Meatup?.RestaurantName ?? "", o.Meatup?.EventDate ?? default,
        o.UserId, o.User?.DisplayName ?? "", o.CutName, o.WeightOz, o.Temperature,
        r.OverallScore, r.ServiceRating, r.AmbianceRating, r.FoodQualityRating, r.TasteRating,
        r.Notes, r.CreatedAt
    );
}
