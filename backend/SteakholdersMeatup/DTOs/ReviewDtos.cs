namespace SteakholdersMeatup.DTOs;

public record CreateOrderRequest(string CutName, int? WeightOz, string? Temperature);

public record OrderDto(int Id, int MeatupId, int UserId, string CutName, int? WeightOz, string? Temperature, bool HasReview);

public record SubmitReviewRequest(
    int ServiceRating,
    int AmbianceRating,
    int FoodQualityRating,
    int TasteRating,
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
    string? Temperature,
    double OverallScore,
    int ServiceRating,
    int AmbianceRating,
    int FoodQualityRating,
    int TasteRating,
    string? Notes,
    DateTime CreatedAt
);

public record ReviewsResponse(int Total, List<ReviewDetailDto> Reviews);

public record UserStatsDto(int MeatupCount, double AverageScore, decimal TotalSpend);
