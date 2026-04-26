namespace SteakholdersMeatup.Models;

public class ReviewPhoto
{
    public int Id { get; set; }
    public int ReviewId { get; set; }
    public string FileName { get; set; } = "";
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public Review Review { get; set; } = null!;
}
