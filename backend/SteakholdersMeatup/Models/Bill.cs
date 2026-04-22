namespace SteakholdersMeatup.Models;

public class Bill
{
    public int Id { get; set; }
    public int MeatupId { get; set; }
    public decimal TotalAmount { get; set; }
    public int TipPercent { get; set; }
    public bool TaxIncluded { get; set; }
    public decimal SplitAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Meatup Meatup { get; set; } = null!;
    public ICollection<Payment> Payments { get; set; } = [];
}
