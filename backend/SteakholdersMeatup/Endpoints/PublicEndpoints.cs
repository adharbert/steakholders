using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;
using SteakholdersMeatup.Services;

namespace SteakholdersMeatup.Endpoints;

public static class PublicEndpoints
{
    public static void MapPublicEndpoints(this WebApplication app)
    {
        // List all restaurants with aggregate stats (uses Restaurant entity)
        app.MapGet("/api/public/restaurants", async (AppDbContext db) =>
        {
            var restaurants = await db.Restaurants
                .Include(r => r.Meatups).ThenInclude(m => m.Orders).ThenInclude(o => o.Review)
                .ToListAsync();

            var dtos = restaurants.Select(r =>
            {
                var scores = r.Meatups
                    .SelectMany(m => m.Orders.Where(o => o.Review != null).Select(o => (double)o.Review!.OverallScore))
                    .ToList();

                return new PublicRestaurantDto(
                    r.Name,
                    $"{r.City}, {r.State}",
                    scores.Count > 0 ? Math.Round(scores.Average(), 1) : null,
                    scores.Count,
                    r.Meatups.Count,
                    r.Meatups.Count > 0 ? r.Meatups.Max(m => m.EventDate) : r.CreatedAt
                );
            })
            .OrderByDescending(r => r.LastVisit)
            .ToList();

            // Also include legacy meatups that have RestaurantName set but no RestaurantId
            var legacyMeatups = await db.Meatups
                .Include(m => m.Orders).ThenInclude(o => o.Review)
                .Where(m => m.RestaurantId == null && m.RestaurantName != null && m.VenueType == "restaurant")
                .ToListAsync();

            var legacyDtos = legacyMeatups
                .GroupBy(m => m.RestaurantName)
                .Select(g =>
                {
                    var scores = g.SelectMany(m => m.Orders
                        .Where(o => o.Review != null)
                        .Select(o => (double)o.Review!.OverallScore))
                        .ToList();
                    return new PublicRestaurantDto(
                        g.Key!,
                        g.First().Location ?? "",
                        scores.Count > 0 ? Math.Round(scores.Average(), 1) : null,
                        scores.Count,
                        g.Count(),
                        g.Max(m => m.EventDate)
                    );
                }).ToList();

            return Results.Ok(dtos.Concat(legacyDtos).OrderByDescending(r => r.LastVisit));
        });

        // Single restaurant detail (by name — supports both entity and legacy)
        app.MapGet("/api/public/restaurants/{name}", async (string name, AppDbContext db) =>
        {
            var decodedName = Uri.UnescapeDataString(name);

            // Try Restaurant entity first
            var restaurant = await db.Restaurants
                .Include(r => r.Meatups)
                    .ThenInclude(m => m.Orders).ThenInclude(o => o.Review).ThenInclude(r => r!.Photos)
                .FirstOrDefaultAsync(r => r.Name == decodedName);

            if (restaurant is not null)
            {
                var reviews = restaurant.Meatups
                    .SelectMany(m => m.Orders.Where(o => o.Review != null).Select(o =>
                    {
                        var photoUrls = o.Review!.Photos
                            .Select(p => $"/uploads/{o.Review.Id}/{p.FileName}").ToList();
                        return new PublicReviewDto(
                            o.Review.Id, o.CutName, o.WeightOz, o.Temperature,
                            o.Review.OverallScore, o.Review.Notes, o.Review.CreatedAt, photoUrls);
                    }))
                    .OrderByDescending(r => r.CreatedAt).ToList();

                var allScores = reviews.Select(r => r.OverallScore).ToList();
                double? avgScore = allScores.Count > 0 ? Math.Round(allScores.Average(), 1) : null;

                var summary = await db.RestaurantSummaries.FirstOrDefaultAsync(s => s.RestaurantName == decodedName);

                return Results.Ok(new RestaurantDetailDto(
                    decodedName,
                    $"{restaurant.City}, {restaurant.State}",
                    avgScore, restaurant.Meatups.Count, reviews,
                    summary?.SummaryText,
                    restaurant.Meatups.Count > 0 ? restaurant.Meatups.Max(m => m.EventDate) : restaurant.CreatedAt
                ));
            }

            // Fall back to legacy RestaurantName string grouping
            var meatups = await db.Meatups
                .Include(m => m.Orders).ThenInclude(o => o.Review).ThenInclude(r => r!.Photos)
                .Where(m => m.RestaurantName == decodedName)
                .OrderByDescending(m => m.EventDate)
                .ToListAsync();

            if (meatups.Count == 0)
                return Results.NotFound(new { error = "Restaurant not found." });

            var legacyReviews = meatups
                .SelectMany(m => m.Orders.Where(o => o.Review != null).Select(o =>
                {
                    var photoUrls = o.Review!.Photos
                        .Select(p => $"/uploads/{o.Review.Id}/{p.FileName}").ToList();
                    return new PublicReviewDto(
                        o.Review.Id, o.CutName, o.WeightOz, o.Temperature,
                        o.Review.OverallScore, o.Review.Notes, o.Review.CreatedAt, photoUrls);
                }))
                .OrderByDescending(r => r.CreatedAt).ToList();

            var legacyScores = legacyReviews.Select(r => r.OverallScore).ToList();
            double? legacyAvg = legacyScores.Count > 0 ? Math.Round(legacyScores.Average(), 1) : null;
            var legacySummary = await db.RestaurantSummaries.FirstOrDefaultAsync(s => s.RestaurantName == decodedName);

            return Results.Ok(new RestaurantDetailDto(
                decodedName, meatups.First().Location ?? "",
                legacyAvg, meatups.Count, legacyReviews,
                legacySummary?.SummaryText, meatups.Max(m => m.EventDate)
            ));
        });

        // Generate (or regenerate) AI summary
        app.MapPost("/api/public/restaurants/{name}/summary", async (
            string name,
            AppDbContext db,
            LlmSummaryService llm) =>
        {
            var decodedName = Uri.UnescapeDataString(name);

            var orders = await db.Orders
                .Include(o => o.Review)
                .Include(o => o.Meatup).ThenInclude(m => m.Restaurant)
                .Where(o => (o.Meatup.Restaurant != null
                    ? o.Meatup.Restaurant.Name == decodedName
                    : o.Meatup.RestaurantName == decodedName)
                    && o.Review != null)
                .ToListAsync();

            if (orders.Count == 0)
                return Results.NotFound(new { error = "No reviews found for this restaurant." });

            var reviewData = orders.Select(o => (o.CutName, (double)o.Review!.OverallScore, o.Review.Notes));
            var summaryText = await llm.GenerateSummaryAsync(decodedName, reviewData);

            if (summaryText is null)
                return Results.Problem(
                    "AI summary service is unavailable. Make sure Anthropic:ApiKey is configured.",
                    statusCode: 503);

            var existing = await db.RestaurantSummaries.FirstOrDefaultAsync(s => s.RestaurantName == decodedName);
            if (existing is not null)
            {
                existing.SummaryText = summaryText;
                existing.GeneratedAt = DateTime.UtcNow;
                existing.ReviewCount = orders.Count;
            }
            else
            {
                db.RestaurantSummaries.Add(new RestaurantSummary
                {
                    RestaurantName = decodedName,
                    SummaryText = summaryText,
                    ReviewCount = orders.Count
                });
            }
            await db.SaveChangesAsync();

            return Results.Ok(new { summary = summaryText });
        });

        // Recent public reviews feed
        app.MapGet("/api/public/reviews", async (AppDbContext db, int? limit) =>
        {
            var reviews = await db.Reviews
                .Include(r => r.Order).ThenInclude(o => o.Meatup).ThenInclude(m => m.Restaurant)
                .Include(r => r.Photos)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit ?? 10)
                .ToListAsync();

            var dtos = reviews.Select(r => new PublicReviewDto(
                r.Id,
                r.Order.CutName,
                r.Order.WeightOz,
                r.Order.Temperature,
                r.OverallScore,
                r.Notes,
                r.CreatedAt,
                r.Photos.Select(p => $"/uploads/{r.Id}/{p.FileName}").ToList()
            )).ToList();

            return Results.Ok(dtos);
        });
    }
}
