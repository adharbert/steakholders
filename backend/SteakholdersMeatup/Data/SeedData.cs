using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Users.Any()) return;

        // Phase 1 — users
        var katie  = new User { Username = "katie",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Katie",  Role = "President"   };
        var andy   = new User { Username = "andy",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Andy",   Role = "Founder"     };
        var jordan = new User { Username = "jordan", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Jordan", Role = "Treasurer"   };
        var marcus = new User { Username = "marcus", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Marcus", Role = "Grill Master" };
        db.Users.AddRange(katie, andy, jordan, marcus);
        db.SaveChanges();
        // Capture IDs before clearing tracker
        int katieId = katie.Id, andyId = andy.Id, jordanId = jordan.Id, marcusId = marcus.Id;
        db.ChangeTracker.Clear();

        // Phase 2 — meatups
        var pastMeatup     = new Meatup { RestaurantName = "Bern's Steak House", Location = "Tampa, Florida", EventDate = DateTime.UtcNow.AddMonths(-2), CreatedByUserId = katieId };
        var upcomingMeatup = new Meatup { RestaurantName = "Peter Luger",        Location = "Brooklyn, NY",   EventDate = DateTime.UtcNow.AddMonths(1),  CreatedByUserId = andyId  };
        db.Meatups.AddRange(pastMeatup, upcomingMeatup);
        db.SaveChanges();
        int pastId = pastMeatup.Id, upcomingId = upcomingMeatup.Id;
        db.ChangeTracker.Clear();

        // Phase 3 — attendances
        db.Attendances.AddRange(
            new Attendance { MeatupId = pastId,     UserId = katieId,  Status = "going" },
            new Attendance { MeatupId = pastId,     UserId = andyId,   Status = "going" },
            new Attendance { MeatupId = pastId,     UserId = jordanId, Status = "going" },
            new Attendance { MeatupId = pastId,     UserId = marcusId, Status = "going" },
            new Attendance { MeatupId = upcomingId, UserId = andyId,   Status = "going" },
            new Attendance { MeatupId = upcomingId, UserId = katieId,  Status = "going" },
            new Attendance { MeatupId = upcomingId, UserId = jordanId, Status = "maybe" }
        );
        db.SaveChanges();
        db.ChangeTracker.Clear();

        // Phase 4 — orders
        var order1 = new Order { MeatupId = pastId, UserId = katieId,  CutName = "Dry-Aged Ribeye",   WeightOz = 22 };
        var order2 = new Order { MeatupId = pastId, UserId = andyId,   CutName = "Tomahawk, Bone-In", WeightOz = 38 };
        var order3 = new Order { MeatupId = pastId, UserId = marcusId, CutName = "Wagyu Filet",       WeightOz = 6  };
        db.Orders.AddRange(order1, order2, order3);
        db.SaveChanges();
        int o1 = order1.Id, o2 = order2.Id, o3 = order3.Id;
        db.ChangeTracker.Clear();

        // Phase 5 — reviews
        db.Reviews.AddRange(
            new Review { OrderId = o1, DonenessRating = 5, FlavorRating = 5, TendernessRating = 4, ValueRating = 4, OverallScore = 4.5f,  Notes = "Crust was mesmerizing, interior a touch past medium-rare but forgivable at this marbling." },
            new Review { OrderId = o2, DonenessRating = 4, FlavorRating = 4, TendernessRating = 4, ValueRating = 3, OverallScore = 3.75f, Notes = "A theatrical cut. Sharing portions generously, though the char crossed into bitter." },
            new Review { OrderId = o3, DonenessRating = 5, FlavorRating = 5, TendernessRating = 5, ValueRating = 4, OverallScore = 4.75f, Notes = "Buttery beyond reason. Small portion but one of the finest bites of the year." }
        );
        db.SaveChanges();
        db.ChangeTracker.Clear();

        // Phase 6 — bill
        var bill = new Bill { MeatupId = pastId, TotalAmount = 856.00m, TipPercent = 22, TaxIncluded = true, SplitAmount = 214.00m };
        db.Bills.Add(bill);
        db.SaveChanges();
        int billId = bill.Id;
        db.ChangeTracker.Clear();

        // Phase 7 — payments
        db.Payments.AddRange(
            new Payment { BillId = billId, UserId = katieId,  Paid = true,  PaidAt = DateTime.UtcNow.AddMonths(-2) },
            new Payment { BillId = billId, UserId = andyId,   Paid = true,  PaidAt = DateTime.UtcNow.AddMonths(-2) },
            new Payment { BillId = billId, UserId = jordanId, Paid = false },
            new Payment { BillId = billId, UserId = marcusId, Paid = false }
        );
        db.SaveChanges();
        db.ChangeTracker.Clear();
    }
}
