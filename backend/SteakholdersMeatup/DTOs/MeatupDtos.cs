namespace SteakholdersMeatup.DTOs;

public record CreateMeatupRequest(
    string VenueType, // restaurant | home | park | other
    DateTime EventDate,
    int? GroupId = null,
    string? Notes = null,
    // For restaurant events
    int? RestaurantId = null,
    // For non-restaurant events
    string? VenueName = null,
    string? VenueStreet1 = null,
    string? VenueCity = null,
    string? VenueState = null,
    string? VenueZip = null,
    string? VenueCountry = null
);

public record UpdateMeatupRequest(
    string VenueType,
    DateTime EventDate,
    string? Notes = null,
    int? GroupId = null,
    int? RestaurantId = null,
    string? VenueName = null,
    string? VenueStreet1 = null,
    string? VenueCity = null,
    string? VenueState = null,
    string? VenueZip = null,
    string? VenueCountry = null
);

public record MeatupSummaryDto(
    int Id,
    string VenueType,
    string DisplayName,
    string DisplayLocation,
    DateTime EventDate,
    int AttendeeCount,
    string? MyRsvpStatus,
    double? AverageScore,
    UserDto CreatedBy,
    int? GroupId,
    string? GroupName
);

public record AttendeeDto(int UserId, string DisplayName, string Role, string Status);

public record MeatupDetailDto(
    int Id,
    string VenueType,
    string DisplayName,
    string DisplayLocation,
    DateTime EventDate,
    string? Notes,
    int? GroupId,
    string? GroupName,
    int? RestaurantId,
    List<AttendeeDto> Attendees,
    List<ReviewDetailDto> Reviews,
    BillDto? Bill
);

public record RsvpRequest(string Status);
public record RsvpResponse(int MeatupId, int UserId, string Status, DateTime RespondedAt);
