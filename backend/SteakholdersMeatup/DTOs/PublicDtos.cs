namespace SteakholdersMeatup.DTOs;

public record PublicRestaurantDto(
    string Name,
    string? Location,
    double? AvgScore,
    int ReviewCount,
    int VisitCount,
    DateTime? LastVisit
);

public record PublicReviewDto(
    int Id,
    string CutName,
    int? WeightOz,
    string? Temperature,
    double OverallScore,
    string? Notes,
    DateTime CreatedAt,
    List<string> PhotoUrls
);

public record RestaurantDetailDto(
    string Name,
    string? Location,
    double? AvgScore,
    int VisitCount,
    List<PublicReviewDto> Reviews,
    string? AiSummary,
    DateTime? LastVisit
);

public record PhotoResponseDto(int Id, string Url, DateTime UploadedAt);
