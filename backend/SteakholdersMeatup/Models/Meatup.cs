namespace SteakholdersMeatup.Models;

public class Meatup
{
    public int Id { get; set; }
    public string RestaurantName { get; set; } = "";
    public string Location { get; set; } = "";
    public DateTime EventDate { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedBy { get; set; } = null!;
    public ICollection<Attendance> Attendances { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public Bill? Bill { get; set; }
}
