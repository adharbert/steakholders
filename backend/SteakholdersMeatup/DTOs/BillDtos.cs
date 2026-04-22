namespace SteakholdersMeatup.DTOs;

public record CreateBillRequest(decimal TotalAmount, int TipPercent, bool TaxIncluded);
public record UpdateBillRequest(decimal TotalAmount, int TipPercent, bool TaxIncluded);
public record UpdatePaymentRequest(bool Paid);

public record PaymentDto(int UserId, string DisplayName, string Role, bool Paid, DateTime? PaidAt);

public record BillDto(
    int Id,
    int MeatupId,
    decimal TotalAmount,
    int TipPercent,
    bool TaxIncluded,
    decimal SplitAmount,
    int AttendeeCount,
    List<PaymentDto> Payments
);
