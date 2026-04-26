namespace SteakholdersMeatup.Models;

public class GroupMembership
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int UserId { get; set; }

    /// <summary>pending | active | rejected</summary>
    public string Status { get; set; } = "pending";

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? JoinedAt { get; set; }

    public Group Group { get; set; } = null!;
    public User User { get; set; } = null!;
}
