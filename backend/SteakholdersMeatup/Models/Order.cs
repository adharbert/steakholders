namespace SteakholdersMeatup.Models;

public class Order
{
    public int Id { get; set; }
    public int MeatupId { get; set; }
    public int UserId { get; set; }
    public string CutName { get; set; } = "";
    public int? WeightOz { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Meatup Meatup { get; set; } = null!;
    public User User { get; set; } = null!;
    public Review? Review { get; set; }
}
