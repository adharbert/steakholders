using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;
using SteakholdersMeatup.Services;

namespace SteakholdersMeatup.Endpoints;

public static class RestaurantEndpoints
{
    public static void MapRestaurantEndpoints(this WebApplication app)
    {
        // Search restaurants: local DB first, Google Places as supplement
        app.MapGet("/api/restaurants/search", async (
            AppDbContext db,
            GeocodingService geocoder,
            PlacesService places,
            string? q,
            string? zip,
            double radiusMiles = 25,
            ClaimsPrincipal? principal = null) =>
        {
            // Query local DB
            var query = db.Restaurants.AsQueryable();
            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(r => r.Name.ToLower().Contains(q.ToLower()) || r.City.ToLower().Contains(q.ToLower()));

            var dbRestaurants = await query.ToListAsync();

            (double Lat, double Lng)? center = null;
            if (!string.IsNullOrWhiteSpace(zip))
                center = await geocoder.ZipToCoordinatesAsync(zip);

            var dtos = dbRestaurants.Select(r =>
            {
                double? dist = null;
                if (center.HasValue && r.Latitude.HasValue && r.Longitude.HasValue)
                    dist = Math.Round(GeocodingService.DistanceMiles(center.Value.Lat, center.Value.Lng, r.Latitude.Value, r.Longitude.Value), 1);
                return new RestaurantDto(r.Id, r.Name, r.Phone, r.Website, r.Street1, r.Street2,
                    r.City, r.State, r.Zip, r.Country, r.Latitude, r.Longitude, r.ExternalPlaceId, dist);
            })
            .Where(r => center is null || r.DistanceMiles is null || r.DistanceMiles <= radiusMiles)
            .OrderBy(r => r.DistanceMiles ?? double.MaxValue)
            .ToList();

            return Results.Ok(new { source = "db", restaurants = dtos });
        }).RequireAuthorization();

        // Seed nearby restaurants from Google Places for a given zip (one-time import)
        app.MapPost("/api/restaurants/import", async (
            AppDbContext db,
            GeocodingService geocoder,
            PlacesService places,
            ClaimsPrincipal principal,
            string zip,
            double radiusMiles = 25) =>
        {
            if (!places.IsConfigured)
                return Results.Problem("Google Places API key not configured.", statusCode: 503);

            var center = await geocoder.ZipToCoordinatesAsync(zip);
            if (center is null)
                return Results.BadRequest(new { error = "Could not geocode zip code." });

            var radiusMeters = (int)(radiusMiles * 1609.34);
            var placeResults = await places.SearchNearbyAsync(center.Value.Lat, center.Value.Lng, radiusMeters);
            if (placeResults is null)
                return Results.Problem("Google Places search failed.", statusCode: 502);

            var userId = GetUserId(principal);
            int added = 0;

            foreach (var p in placeResults)
            {
                if (string.IsNullOrWhiteSpace(p.Name)) continue;
                // Skip if already imported
                if (!string.IsNullOrWhiteSpace(p.PlaceId) && await db.Restaurants.AnyAsync(r => r.ExternalPlaceId == p.PlaceId))
                    continue;

                // Parse FormattedAddress into fields (best-effort)
                var parts = p.FormattedAddress?.Split(',').Select(s => s.Trim()).ToArray() ?? [];

                var restaurant = new Restaurant
                {
                    Name = p.Name,
                    Phone = p.Phone,
                    Website = p.Website,
                    Street1 = parts.Length > 0 ? parts[0] : "",
                    City = parts.Length > 1 ? parts[1] : "",
                    State = parts.Length > 2 ? parts[2].Split(' ').FirstOrDefault() ?? "" : "",
                    Zip = parts.Length > 2 ? parts[2].Split(' ').Skip(1).FirstOrDefault() ?? "" : "",
                    Country = "US",
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    ExternalPlaceId = p.PlaceId,
                    CreatedByUserId = userId
                };
                db.Restaurants.Add(restaurant);
                added++;
            }

            await db.SaveChangesAsync();
            return Results.Ok(new { imported = added });
        }).RequireAuthorization();

        // Manually add a restaurant
        app.MapPost("/api/restaurants", async (
            CreateRestaurantRequest req,
            AppDbContext db,
            GeocodingService geocoder,
            ClaimsPrincipal principal) =>
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return Results.BadRequest(new { error = "Name is required." });
            if (string.IsNullOrWhiteSpace(req.Street1) || string.IsNullOrWhiteSpace(req.City) ||
                string.IsNullOrWhiteSpace(req.State) || string.IsNullOrWhiteSpace(req.Zip))
                return Results.BadRequest(new { error = "Street1, City, State, and Zip are required." });

            var userId = GetUserId(principal);

            // Geocode if no coordinates provided
            double? lat = req.Latitude, lng = req.Longitude;
            if (lat is null || lng is null)
            {
                var coords = await geocoder.ZipToCoordinatesAsync(req.Zip, req.Country);
                lat = coords?.Lat;
                lng = coords?.Lng;
            }

            var restaurant = new Restaurant
            {
                Name = req.Name,
                Phone = req.Phone,
                Website = req.Website,
                Street1 = req.Street1,
                Street2 = req.Street2,
                City = req.City,
                State = req.State,
                Zip = req.Zip,
                Country = req.Country,
                Latitude = lat,
                Longitude = lng,
                ExternalPlaceId = req.ExternalPlaceId,
                CreatedByUserId = userId
            };
            db.Restaurants.Add(restaurant);
            await db.SaveChangesAsync();

            return Results.Created($"/api/restaurants/{restaurant.Id}",
                new RestaurantDto(restaurant.Id, restaurant.Name, restaurant.Phone, restaurant.Website,
                    restaurant.Street1, restaurant.Street2, restaurant.City, restaurant.State,
                    restaurant.Zip, restaurant.Country, restaurant.Latitude, restaurant.Longitude,
                    restaurant.ExternalPlaceId, null));
        }).RequireAuthorization();

        // Get single restaurant
        app.MapGet("/api/restaurants/{id:int}", async (int id, AppDbContext db) =>
        {
            var r = await db.Restaurants.FindAsync(id);
            if (r is null) return Results.NotFound(new { error = "Restaurant not found." });
            return Results.Ok(new RestaurantDto(r.Id, r.Name, r.Phone, r.Website, r.Street1, r.Street2,
                r.City, r.State, r.Zip, r.Country, r.Latitude, r.Longitude, r.ExternalPlaceId, null));
        }).RequireAuthorization();
    }

    private static int GetUserId(ClaimsPrincipal p) =>
        int.Parse(p.FindFirstValue(ClaimTypes.NameIdentifier) ?? p.FindFirstValue("sub") ?? "0");
}
