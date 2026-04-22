using System.Security.Claims;
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
        app.MapPost("/api/auth/register", async (RegisterRequest req, AppDbContext db, TokenService tokens) =>
        {
            if (string.IsNullOrWhiteSpace(req.Username) || req.Username.Length < 3 || req.Username.Length > 50)
                return Results.BadRequest(new { error = "Username must be 3–50 characters." });

            if (!System.Text.RegularExpressions.Regex.IsMatch(req.Username, @"^[a-zA-Z0-9_]+$"))
                return Results.BadRequest(new { error = "Username may only contain letters, numbers, and underscores." });

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 8)
                return Results.BadRequest(new { error = "Password must be at least 8 characters." });

            if (string.IsNullOrWhiteSpace(req.DisplayName) || req.DisplayName.Length > 50)
                return Results.BadRequest(new { error = "Display name is required (max 50 characters)." });

            var exists = await db.Users.AnyAsync(u => u.Username.ToLower() == req.Username.ToLower());
            if (exists)
                return Results.Conflict(new { error = "Username already taken." });

            var user = new User
            {
                Username = req.Username.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                DisplayName = req.DisplayName,
                Role = "Member"
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();

            var token = tokens.GenerateToken(user);
            return Results.Created($"/api/users/{user.Id}", new AuthResponse(token, ToDto(user)));
        });

        app.MapPost("/api/auth/login", async (LoginRequest req, AppDbContext db, TokenService tokens) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username.ToLower());
            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized();

            var token = tokens.GenerateToken(user);
            return Results.Ok(new AuthResponse(token, ToDto(user)));
        });

        app.MapGet("/api/auth/me", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? principal.FindFirstValue("sub") ?? "0");
            var user = await db.Users.FindAsync(userId);
            return user is null ? Results.Unauthorized() : Results.Ok(ToDto(user));
        }).RequireAuthorization();
    }

    private static UserDto ToDto(User u) => new(u.Id, u.Username, u.DisplayName, u.Role);
}
