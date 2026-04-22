namespace SteakholdersMeatup.Models;

public class Review
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int DonenessRating { get; set; }
    public int FlavorRating { get; set; }
    public int TendernessRating { get; set; }
    public int ValueRating { get; set; }
    public float OverallScore { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
}
