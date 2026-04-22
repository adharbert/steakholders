namespace SteakholdersMeatup.DTOs;

public record CreateMeatupRequest(string RestaurantName, string Location, DateTime EventDate, string? Notes);
public record UpdateMeatupRequest(string RestaurantName, string Location, DateTime EventDate, string? Notes);

public record MeatupSummaryDto(
    int Id,
    string RestaurantName,
    string Location,
    DateTime EventDate,
    int AttendeeCount,
    string? MyRsvpStatus,
    double? AverageScore,
    UserDto CreatedBy
);

public record AttendeeDto(int UserId, string DisplayName, string Role, string Status);

public record MeatupDetailDto(
    int Id,
    string RestaurantName,
    string Location,
    DateTime EventDate,
    string? Notes,
    List<AttendeeDto> Attendees,
    List<ReviewDetailDto> Reviews,
    BillDto? Bill
);

public record RsvpRequest(string Status);
public record RsvpResponse(int MeatupId, int UserId, string Status, DateTime RespondedAt);
