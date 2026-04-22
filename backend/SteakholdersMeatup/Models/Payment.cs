namespace SteakholdersMeatup.Models;

public class Payment
{
    public int Id { get; set; }
    public int BillId { get; set; }
    public int UserId { get; set; }
    public bool Paid { get; set; } = false;
    public DateTime? PaidAt { get; set; }

    public Bill Bill { get; set; } = null!;
    public User User { get; set; } = null!;
}
