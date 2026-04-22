namespace SteakholdersMeatup.DTOs;

public record CreateOrderRequest(string CutName, int? WeightOz);

public record OrderDto(int Id, int MeatupId, int UserId, string CutName, int? WeightOz, bool HasReview);

public record SubmitReviewRequest(
    int DonenessRating,
    int FlavorRating,
    int TendernessRating,
    int ValueRating,
    string? Notes
);

public record ReviewDetailDto(
    int Id,
    int MeatupId,
    string RestaurantName,
    DateTime EventDate,
    int UserId,
    string DisplayName,
    string CutName,
    int? WeightOz,
    double OverallScore,
    int DonenessRating,
    int FlavorRating,
    int TendernessRating,
    int ValueRating,
    string? Notes,
    DateTime CreatedAt
);

public record ReviewsResponse(int Total, List<ReviewDetailDto> Reviews);

public record UserStatsDto(int MeatupCount, double AverageScore, decimal TotalSpend);
