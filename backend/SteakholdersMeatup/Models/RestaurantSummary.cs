namespace SteakholdersMeatup.Models;

public class RestaurantSummary
{
    public int Id { get; set; }
    public string RestaurantName { get; set; } = "";
    public string SummaryText { get; set; } = "";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public int ReviewCount { get; set; }
}
