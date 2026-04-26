namespace SteakholdersMeatup.DTOs;

public record RegisterRequest(
    string Username,
    string Password,
    string DisplayName,
    string ZipCode,
    string? Email = null,
    string? InviteCode = null
);

public record LoginRequest(string Username, string Password);

public record OAuthRequest(
    string Provider,   // "google" | "facebook"
    string Token,      // access token
    string? ZipCode = null
);

public record UserDto(int Id, string Username, string DisplayName, string Role);

public record AuthResponse(string Token, UserDto User, bool IsNewUser = false);
