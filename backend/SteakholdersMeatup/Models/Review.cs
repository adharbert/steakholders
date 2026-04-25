namespace SteakholdersMeatup.Models;

public class Review
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ServiceRating { get; set; }
    public int AmbianceRating { get; set; }
    public int FoodQualityRating { get; set; }
    public int TasteRating { get; set; }
    public float OverallScore { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
}
