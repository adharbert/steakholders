namespace SteakholdersMeatup.DTOs;

public record CreateGroupRequest(
    string Name,
    string? Description,
    bool IsPrivate,
    string ZipCode
);

public record GroupDto(
    int Id,
    string Name,
    string? Description,
    bool IsPrivate,
    string InviteCode,
    string ZipCode,
    int LeaderUserId,
    string LeaderDisplayName,
    DateTime CreatedAt,
    int MemberCount
);

public record GroupSummaryDto(
    int Id,
    string Name,
    bool IsPrivate,
    string ZipCode,
    int MemberCount,
    double? DistanceMiles
);

public record GroupMembershipDto(
    int UserId,
    string DisplayName,
    string Role,
    string Status,
    DateTime RequestedAt
);

public record JoinGroupRequest(string? InviteCode = null);

public record ApproveRejectRequest(string Status); // "active" or "rejected"
