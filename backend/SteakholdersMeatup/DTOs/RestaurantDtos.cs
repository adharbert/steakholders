namespace SteakholdersMeatup.DTOs;

public record RestaurantDto(
    int Id,
    string Name,
    string? Phone,
    string? Website,
    string Street1,
    string? Street2,
    string City,
    string State,
    string Zip,
    string Country,
    double? Latitude,
    double? Longitude,
    string? ExternalPlaceId,
    double? DistanceMiles
);

public record CreateRestaurantRequest(
    string Name,
    string Street1,
    string City,
    string State,
    string Zip,
    string Country = "US",
    string? Phone = null,
    string? Website = null,
    string? Street2 = null,
    string? ExternalPlaceId = null,
    double? Latitude = null,
    double? Longitude = null
);
