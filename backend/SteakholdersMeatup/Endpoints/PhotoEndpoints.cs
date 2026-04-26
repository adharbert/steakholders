using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Endpoints;

public static class PhotoEndpoints
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public static void MapPhotoEndpoints(this WebApplication app)
    {
        app.MapPost("/api/reviews/{reviewId:int}/photos", async (
            int reviewId,
            IFormFile file,
            AppDbContext db,
            ClaimsPrincipal principal,
            IWebHostEnvironment env) =>
        {
            var review = await db.Reviews
                .Include(r => r.Order)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review is null)
                return Results.NotFound(new { error = "Review not found." });

            var userId = GetUserId(principal);
            if (review.Order.UserId != userId)
                return Results.Forbid();

            if (file.Length > MaxFileSizeBytes)
                return Results.BadRequest(new { error = "File must be 10 MB or smaller." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                return Results.BadRequest(new { error = "Only JPG, PNG, and WebP images are allowed." });

            var uploadDir = Path.Combine(env.WebRootPath, "uploads", reviewId.ToString());
            Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadDir, fileName);

            await using (var stream = File.Create(filePath))
            {
                await file.CopyToAsync(stream);
            }

            db.ReviewPhotos.Add(new ReviewPhoto { ReviewId = reviewId, FileName = fileName });
            await db.SaveChangesAsync();

            return Results.Ok(new { url = $"/uploads/{reviewId}/{fileName}" });
        })
        .RequireAuthorization()
        .DisableAntiforgery();

        app.MapGet("/api/reviews/{reviewId:int}/photos", async (int reviewId, AppDbContext db) =>
        {
            var photos = await db.ReviewPhotos
                .Where(p => p.ReviewId == reviewId)
                .OrderBy(p => p.UploadedAt)
                .Select(p => new PhotoResponseDto(p.Id, $"/uploads/{reviewId}/{p.FileName}", p.UploadedAt))
                .ToListAsync();

            return Results.Ok(photos);
        });

        app.MapDelete("/api/photos/{photoId:int}", async (
            int photoId,
            AppDbContext db,
            ClaimsPrincipal principal,
            IWebHostEnvironment env) =>
        {
            var photo = await db.ReviewPhotos
                .Include(p => p.Review).ThenInclude(r => r.Order)
                .FirstOrDefaultAsync(p => p.Id == photoId);

            if (photo is null) return Results.NotFound();

            var userId = GetUserId(principal);
            if (photo.Review.Order.UserId != userId) return Results.Forbid();

            var filePath = Path.Combine(env.WebRootPath, "uploads", photo.ReviewId.ToString(), photo.FileName);
            if (File.Exists(filePath)) File.Delete(filePath);

            db.ReviewPhotos.Remove(photo);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }).RequireAuthorization();
    }

    private static int GetUserId(ClaimsPrincipal p) =>
        int.Parse(p.FindFirstValue(ClaimTypes.NameIdentifier) ?? p.FindFirstValue("sub") ?? "0");
}
