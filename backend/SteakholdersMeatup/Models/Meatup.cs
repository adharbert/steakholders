namespace SteakholdersMeatup.Models;

public class Meatup
{
    public int Id { get; set; }

    // Legacy fields kept nullable for migration compatibility
    public string? RestaurantName { get; set; }
    public string? Location { get; set; }

    // Venue
    public string VenueType { get; set; } = "restaurant"; // restaurant | home | park | other
    public int? GroupId { get; set; }
    public int? RestaurantId { get; set; }
    public string? VenueName { get; set; }
    public string? VenueStreet1 { get; set; }
    public string? VenueCity { get; set; }
    public string? VenueState { get; set; }
    public string? VenueZip { get; set; }
    public string? VenueCountry { get; set; }
    public double? VenueLatitude { get; set; }
    public double? VenueLongitude { get; set; }

    public DateTime EventDate { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedBy { get; set; } = null!;
    public Group? Group { get; set; }
    public Restaurant? Restaurant { get; set; }
    public ICollection<Attendance> Attendances { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public Bill? Bill { get; set; }
}
