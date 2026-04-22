namespace SteakholdersMeatup.Models;

public class Attendance
{
    public int Id { get; set; }
    public int MeatupId { get; set; }
    public int UserId { get; set; }
    public string Status { get; set; } = "going"; // going | maybe | not_going
    public DateTime RespondedAt { get; set; } = DateTime.UtcNow;

    public Meatup Meatup { get; set; } = null!;
    public User User { get; set; } = null!;
}
