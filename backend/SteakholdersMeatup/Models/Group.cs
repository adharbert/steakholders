namespace SteakholdersMeatup.Models;

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public bool IsPrivate { get; set; }
    public string InviteCode { get; set; } = "";
    public string ZipCode { get; set; } = "";
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int LeaderUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Leader { get; set; } = null!;
    public ICollection<GroupMembership> Memberships { get; set; } = [];
    public ICollection<Meatup> Meatups { get; set; } = [];
}
