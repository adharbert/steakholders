using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.DTOs;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Endpoints;

public static class BillEndpoints
{
    public static void MapBillEndpoints(this WebApplication app)
    {
        app.MapPost("/api/meatups/{meatupId:int}/bill", async (
            int meatupId,
            CreateBillRequest req,
            AppDbContext db) =>
        {
            if (req.TotalAmount <= 0) return Results.BadRequest(new { error = "Total amount must be positive." });

            var meatup = await db.Meatups.FindAsync(meatupId);
            if (meatup is null) return Results.NotFound(new { error = "Meatup not found." });

            var exists = await db.Bills.AnyAsync(b => b.MeatupId == meatupId);
            if (exists) return Results.Conflict(new { error = "A bill already exists for this meatup." });

            var goingAttendees = await db.Attendances
                .Include(a => a.User)
                .Where(a => a.MeatupId == meatupId && a.Status == "going")
                .ToListAsync();

            if (goingAttendees.Count == 0) return Results.BadRequest(new { error = "No confirmed attendees to split the bill." });

            var splitAmount = Math.Round(req.TotalAmount / goingAttendees.Count, 2, MidpointRounding.AwayFromZero);

            var bill = new Bill
            {
                MeatupId = meatupId,
                TotalAmount = req.TotalAmount,
                TipPercent = req.TipPercent,
                TaxIncluded = req.TaxIncluded,
                SplitAmount = splitAmount
            };
            db.Bills.Add(bill);
            await db.SaveChangesAsync();

            var payments = goingAttendees.Select(a => new Payment { BillId = bill.Id, UserId = a.UserId }).ToList();
            db.Payments.AddRange(payments);
            await db.SaveChangesAsync();

            await db.Entry(bill).Collection(b => b.Payments).Query().Include(p => p.User).LoadAsync();

            return Results.Created($"/api/meatups/{meatupId}/bill", ToBillDto(bill, goingAttendees.Count));
        }).RequireAuthorization();

        app.MapGet("/api/meatups/{meatupId:int}/bill", async (int meatupId, AppDbContext db) =>
        {
            var bill = await db.Bills
                .Include(b => b.Payments).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(b => b.MeatupId == meatupId);

            if (bill is null) return Results.NotFound(new { error = "No bill found for this meatup." });

            return Results.Ok(ToBillDto(bill, bill.Payments.Count));
        }).RequireAuthorization();

        app.MapPatch("/api/meatups/{meatupId:int}/bill/payments/{userId:int}", async (
            int meatupId,
            int userId,
            UpdatePaymentRequest req,
            AppDbContext db) =>
        {
            var bill = await db.Bills.FirstOrDefaultAsync(b => b.MeatupId == meatupId);
            if (bill is null) return Results.NotFound(new { error = "No bill found for this meatup." });

            var payment = await db.Payments
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.BillId == bill.Id && p.UserId == userId);
            if (payment is null) return Results.NotFound(new { error = "Payment record not found." });

            payment.Paid = req.Paid;
            payment.PaidAt = req.Paid ? DateTime.UtcNow : null;
            await db.SaveChangesAsync();

            return Results.Ok(new PaymentDto(payment.UserId, payment.User.DisplayName, payment.User.Role, payment.Paid, payment.PaidAt));
        }).RequireAuthorization();

        app.MapPut("/api/meatups/{meatupId:int}/bill", async (int meatupId, UpdateBillRequest req, AppDbContext db) =>
        {
            var bill = await db.Bills.Include(b => b.Payments).ThenInclude(p => p.User).FirstOrDefaultAsync(b => b.MeatupId == meatupId);
            if (bill is null) return Results.NotFound(new { error = "No bill found for this meatup." });

            if (bill.Payments.Any(p => p.Paid)) return Results.BadRequest(new { error = "Cannot update bill after members have already paid." });

            var attendeeCount = bill.Payments.Count;
            bill.TotalAmount = req.TotalAmount;
            bill.TipPercent = req.TipPercent;
            bill.TaxIncluded = req.TaxIncluded;
            bill.SplitAmount = attendeeCount > 0 ? Math.Round(req.TotalAmount / attendeeCount, 2, MidpointRounding.AwayFromZero) : 0;
            await db.SaveChangesAsync();

            return Results.Ok(ToBillDto(bill, attendeeCount));
        }).RequireAuthorization();
    }

    private static BillDto ToBillDto(Bill bill, int count) => new(
        bill.Id, bill.MeatupId, bill.TotalAmount, bill.TipPercent, bill.TaxIncluded, bill.SplitAmount, count,
        bill.Payments.Select(p => new PaymentDto(p.UserId, p.User.DisplayName, p.User.Role, p.Paid, p.PaidAt)).ToList()
    );
}
