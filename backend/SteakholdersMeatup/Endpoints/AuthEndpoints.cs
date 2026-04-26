using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;
using SteakholdersMeatup.Services;

namespace SteakholdersMeatup.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/register", async (
            RegisterRequest req,
            AppDbContext db,
            TokenService tokens,
            GeocodingService geocoder) =>
        {
            if (string.IsNullOrWhiteSpace(req.Username) || req.Username.Length < 3 || req.Username.Length > 50)
                return Results.BadRequest(new { error = "Username must be 3–50 characters." });

            if (!Regex.IsMatch(req.Username, @"^[a-zA-Z0-9_]+$"))
                return Results.BadRequest(new { error = "Username may only contain letters, numbers, and underscores." });

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 8)
                return Results.BadRequest(new { error = "Password must be at least 8 characters." });

            if (string.IsNullOrWhiteSpace(req.DisplayName) || req.DisplayName.Length > 50)
                return Results.BadRequest(new { error = "Display name is required (max 50 characters)." });

            if (string.IsNullOrWhiteSpace(req.ZipCode))
                return Results.BadRequest(new { error = "ZipCode is required." });

            var exists = await db.Users.AnyAsync(u => u.Username.ToLower() == req.Username.ToLower());
            if (exists)
                return Results.Conflict(new { error = "Username already taken." });

            var coords = await geocoder.ZipToCoordinatesAsync(req.ZipCode);

            var user = new User
            {
                Username = req.Username.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                DisplayName = req.DisplayName,
                Role = "Member",
                Email = req.Email,
                ZipCode = req.ZipCode,
                Latitude = coords?.Lat,
                Longitude = coords?.Lng
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(req.InviteCode))
            {
                var group = await db.Groups.FirstOrDefaultAsync(g => g.InviteCode == req.InviteCode);
                if (group is not null)
                {
                    db.GroupMemberships.Add(new GroupMembership
                    {
                        GroupId = group.Id,
                        UserId = user.Id,
                        Status = "active",
                        JoinedAt = DateTime.UtcNow
                    });
                    await db.SaveChangesAsync();
                }
            }

            var token = tokens.GenerateToken(user);
            return Results.Created($"/api/users/{user.Id}", new AuthResponse(token, ToDto(user)));
        });

        app.MapPost("/api/auth/login", async (LoginRequest req, AppDbContext db, TokenService tokens) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username.ToLower());
            if (user is null || user.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized();

            var token = tokens.GenerateToken(user);
            return Results.Ok(new AuthResponse(token, ToDto(user)));
        });

        app.MapPost("/api/auth/oauth", async (
            OAuthRequest req,
            AppDbContext db,
            TokenService tokens,
            GeocodingService geocoder,
            IHttpClientFactory httpFactory) =>
        {
            string? providerUserId, email, displayName;

            if (req.Provider == "google")
            {
                var client = httpFactory.CreateClient();
                var resp = await client.GetAsync(
                    $"https://www.googleapis.com/oauth2/v2/userinfo?access_token={req.Token}");
                if (!resp.IsSuccessStatusCode)
                    return Results.Unauthorized();

                var info = await resp.Content.ReadFromJsonAsync<GoogleUserInfo>();
                if (info?.Id is null)
                    return Results.Unauthorized();

                providerUserId = info.Id;
                email = info.Email;
                displayName = info.Name;
            }
            else if (req.Provider == "facebook")
            {
                var client = httpFactory.CreateClient();
                var resp = await client.GetAsync(
                    $"https://graph.facebook.com/me?fields=id,name,email&access_token={req.Token}");
                if (!resp.IsSuccessStatusCode)
                    return Results.Unauthorized();

                var info = await resp.Content.ReadFromJsonAsync<FacebookUserInfo>();
                if (info?.Id is null)
                    return Results.Unauthorized();

                providerUserId = info.Id;
                email = info.Email;
                displayName = info.Name;
            }
            else
            {
                return Results.BadRequest(new { error = "Unknown OAuth provider." });
            }

            // Find existing user by provider
            var user = await db.Users.FirstOrDefaultAsync(u =>
                u.AuthProvider == req.Provider && u.ProviderUserId == providerUserId);

            // Fall back to email match (links existing password account)
            if (user is null && email is not null)
                user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

            var isNewUser = false;

            if (user is null)
            {
                isNewUser = true;
                var baseUsername = BuildUsername(email, displayName);
                var username = await UniqueUsernameAsync(db, baseUsername);

                var coords = !string.IsNullOrWhiteSpace(req.ZipCode)
                    ? await geocoder.ZipToCoordinatesAsync(req.ZipCode)
                    : null;

                user = new User
                {
                    Username = username,
                    DisplayName = displayName ?? username,
                    Role = "Member",
                    Email = email,
                    AuthProvider = req.Provider,
                    ProviderUserId = providerUserId,
                    ZipCode = req.ZipCode ?? "",
                    Latitude = coords?.Lat,
                    Longitude = coords?.Lng,
                };
                db.Users.Add(user);
            }
            else
            {
                // Link provider to existing account if not already linked
                if (user.AuthProvider is null)
                {
                    user.AuthProvider = req.Provider;
                    user.ProviderUserId = providerUserId;
                }

                // Fill in missing zip code
                if (!string.IsNullOrWhiteSpace(req.ZipCode) && string.IsNullOrWhiteSpace(user.ZipCode))
                {
                    var coords = await geocoder.ZipToCoordinatesAsync(req.ZipCode);
                    user.ZipCode = req.ZipCode;
                    user.Latitude = coords?.Lat;
                    user.Longitude = coords?.Lng;
                }
            }

            await db.SaveChangesAsync();

            var jwtToken = tokens.GenerateToken(user);
            return Results.Ok(new AuthResponse(jwtToken, ToDto(user), isNewUser));
        });

        app.MapGet("/api/auth/me", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? principal.FindFirstValue("sub") ?? "0");
            var user = await db.Users.FindAsync(userId);
            return user is null ? Results.Unauthorized() : Results.Ok(ToDto(user));
        }).RequireAuthorization();
    }

    private static string BuildUsername(string? email, string? displayName)
    {
        var source = email?.Split('@')[0] ?? displayName ?? "user";
        var clean = Regex.Replace(source.ToLower(), @"[^a-z0-9]", "_");
        clean = Regex.Replace(clean, @"_+", "_").Trim('_');
        if (clean.Length < 3) clean = "user_" + clean;
        return clean[..Math.Min(40, clean.Length)];
    }

    private static async Task<string> UniqueUsernameAsync(AppDbContext db, string @base)
    {
        var candidate = @base;
        var i = 1;
        while (await db.Users.AnyAsync(u => u.Username == candidate))
            candidate = @base + i++;
        return candidate;
    }

    private static UserDto ToDto(User u) => new(u.Id, u.Username, u.DisplayName, u.Role);

    private record GoogleUserInfo(
        [property: JsonPropertyName("id")]    string? Id,
        [property: JsonPropertyName("email")] string? Email,
        [property: JsonPropertyName("name")]  string? Name
    );

    private record FacebookUserInfo(
        [property: JsonPropertyName("id")]    string? Id,
        [property: JsonPropertyName("name")]  string? Name,
        [property: JsonPropertyName("email")] string? Email
    );
}
