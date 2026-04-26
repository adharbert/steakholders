namespace SteakholdersMeatup.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string DisplayName { get; set; } = "";
    public string Role { get; set; } = "Member";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Email { get; set; }
    public string? AuthProvider { get; set; }
    public string? ProviderUserId { get; set; }

    // Location — ZipCode required; full address optional
    public string ZipCode { get; set; } = "";
    public string? Street1 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public ICollection<Attendance> Attendances { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
    public ICollection<Meatup> CreatedMeatups { get; set; } = [];
    public ICollection<GroupMembership> GroupMemberships { get; set; } = [];
}
