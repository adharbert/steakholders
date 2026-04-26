namespace SteakholdersMeatup.Models;

public class Restaurant
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string Street1 { get; set; } = "";
    public string? Street2 { get; set; }
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string Zip { get; set; } = "";
    public string Country { get; set; } = "US";
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ExternalPlaceId { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedBy { get; set; } = null!;
    public ICollection<Meatup> Meatups { get; set; } = [];
}
