using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Services;

public class TokenService(IConfiguration config)
{
    public string GenerateToken(User user)
    {
        var secret = config["Jwt:Secret"] ?? "dev-secret-change-me-in-production-32chars!!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(double.Parse(config["Jwt:ExpiryMinutes"] ?? "10080"));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"] ?? "steakholders-api",
            audience: config["Jwt:Audience"] ?? "steakholders-app",
            claims:
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.DisplayName),
                new Claim(ClaimTypes.Role, user.Role),
            ],
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
