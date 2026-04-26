using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Users.Any()) return;

        // Phase 1 — users
        var katie  = new User { Username = "katie",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Katie",  Role = "President",   ZipCode = "33602" };
        var andy   = new User { Username = "andy",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Andy",   Role = "Founder",     ZipCode = "33602" };
        var jordan = new User { Username = "jordan", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Jordan", Role = "Treasurer",   ZipCode = "33602" };
        var marcus = new User { Username = "marcus", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), DisplayName = "Marcus", Role = "Grill Master", ZipCode = "33602" };
        db.Users.AddRange(katie, andy, jordan, marcus);
        db.SaveChanges();
        int katieId = katie.Id, andyId = andy.Id, jordanId = jordan.Id, marcusId = marcus.Id;
        db.ChangeTracker.Clear();

        // Phase 2 — group
        var group = new Group
        {
            Name = "Steakholders",
            Description = "The original steak appreciation club.",
            IsPrivate = false,
            InviteCode = "STEAK001",
            ZipCode = "33602",
            LeaderUserId = katieId
        };
        db.Groups.Add(group);
        db.SaveChanges();
        int groupId = group.Id;
        db.ChangeTracker.Clear();

        // Phase 3 — group memberships
        db.GroupMemberships.AddRange(
            new GroupMembership { GroupId = groupId, UserId = katieId,  Status = "active", JoinedAt = DateTime.UtcNow.AddMonths(-6) },
            new GroupMembership { GroupId = groupId, UserId = andyId,   Status = "active", JoinedAt = DateTime.UtcNow.AddMonths(-6) },
            new GroupMembership { GroupId = groupId, UserId = jordanId, Status = "active", JoinedAt = DateTime.UtcNow.AddMonths(-5) },
            new GroupMembership { GroupId = groupId, UserId = marcusId, Status = "active", JoinedAt = DateTime.UtcNow.AddMonths(-4) }
        );
        db.SaveChanges();
        db.ChangeTracker.Clear();

        // Phase 4 — restaurants
        var bernsRestaurant = new Restaurant
        {
            Name = "Bern's Steak House",
            Phone = "(813) 251-2421",
            Website = "https://bernssteakhouse.com",
            Street1 = "1208 S Howard Ave",
            City = "Tampa",
            State = "FL",
            Zip = "33606",
            Country = "US",
            Latitude = 27.9350,
            Longitude = -82.4824,
            CreatedByUserId = katieId
        };
        var peterLuger = new Restaurant
        {
            Name = "Peter Luger",
            Phone = "(718) 387-7400",
            Website = "https://peterluger.com",
            Street1 = "178 Broadway",
            City = "Brooklyn",
            State = "NY",
            Zip = "11211",
            Country = "US",
            Latitude = 40.7099,
            Longitude = -73.9623,
            CreatedByUserId = andyId
        };
        db.Restaurants.AddRange(bernsRestaurant, peterLuger);
        db.SaveChanges();
        int bernsId = bernsRestaurant.Id, peterLugerID = peterLuger.Id;
        db.ChangeTracker.Clear();

        // Phase 5 — meatups
        var pastMeatup = new Meatup
        {
            VenueType = "restaurant",
            GroupId = groupId,
            RestaurantId = bernsId,
            EventDate = DateTime.UtcNow.AddMonths(-2),
            CreatedByUserId = katieId
        };
        var upcomingMeatup = new Meatup
        {
            VenueType = "restaurant",
            GroupId = groupId,
            RestaurantId = peterLugerID,
            EventDate = DateTime.UtcNow.AddMonths(1),
            CreatedByUserId = andyId
        };
        db.Meatups.AddRange(pastMeatup, upcomingMeatup);
        db.SaveChanges();
        int pastId = pastMeatup.Id, upcomingId = upcomingMeatup.Id;
        db.ChangeTracker.Clear();

        // Phase 6 — attendances
        db.Attendances.AddRange(
            new Attendance { MeatupId = pastId,     UserId = katieId,  Status = "going" },
            new Attendance { MeatupId = pastId,     UserId = andyId,   Status = "going" },
            new Attendance { MeatupId = pastId,     UserId = jordanId, Status = "going" },
            new Attendance { MeatupId = pastId,     UserId = marcusId, Status = "going" },
            new Attendance { MeatupId = upcomingId, UserId = andyId,   Status = "going" },
            new Attendance { MeatupId = upcomingId, UserId = katieId,  Status = "going" },
            new Attendance { MeatupId = upcomingId, UserId = jordanId, Status = "maybe" },
            new Attendance { MeatupId = upcomingId, UserId = marcusId, Status = "pending" }
        );
        db.SaveChanges();
        db.ChangeTracker.Clear();

        // Phase 7 — orders
        var order1 = new Order { MeatupId = pastId, UserId = katieId,  CutName = "Dry-Aged Ribeye",   WeightOz = 22, Temperature = "medium-rare" };
        var order2 = new Order { MeatupId = pastId, UserId = andyId,   CutName = "Tomahawk, Bone-In", WeightOz = 38, Temperature = "medium"      };
        var order3 = new Order { MeatupId = pastId, UserId = marcusId, CutName = "Wagyu Filet",       WeightOz = 6,  Temperature = "rare"        };
        db.Orders.AddRange(order1, order2, order3);
        db.SaveChanges();
        int o1 = order1.Id, o2 = order2.Id, o3 = order3.Id;
        db.ChangeTracker.Clear();

        // Phase 8 — reviews
        db.Reviews.AddRange(
            new Review { OrderId = o1, ServiceRating = 5, AmbianceRating = 4, FoodQualityRating = 5, TasteRating = 4, OverallScore = 4.5f,  Notes = "Crust was mesmerizing, interior a touch past medium-rare but forgivable at this marbling." },
            new Review { OrderId = o2, ServiceRating = 4, AmbianceRating = 4, FoodQualityRating = 4, TasteRating = 3, OverallScore = 3.75f, Notes = "A theatrical cut. Sharing portions generously, though the char crossed into bitter." },
            new Review { OrderId = o3, ServiceRating = 5, AmbianceRating = 5, FoodQualityRating = 5, TasteRating = 4, OverallScore = 4.75f, Notes = "Buttery beyond reason. Small portion but one of the finest bites of the year." }
        );
        db.SaveChanges();
        db.ChangeTracker.Clear();

        // Phase 9 — bill
        var bill = new Bill { MeatupId = pastId, TotalAmount = 856.00m, TipPercent = 22, TaxIncluded = true, SplitAmount = 214.00m };
        db.Bills.Add(bill);
        db.SaveChanges();
        int billId = bill.Id;
        db.ChangeTracker.Clear();

        // Phase 10 — payments
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
