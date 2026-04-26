using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Suppress false-positive snapshot warning from EF Core 10 preview tooling
        optionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<GroupMembership> GroupMemberships => Set<GroupMembership>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Meatup> Meatups => Set<Meatup>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<ReviewPhoto> ReviewPhotos => Set<ReviewPhoto>();
    public DbSet<RestaurantSummary> RestaurantSummaries => Set<RestaurantSummary>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();

        b.Entity<User>()
            .HasIndex(u => u.Email).IsUnique()
            .HasFilter("[Email] IS NOT NULL");

        b.Entity<User>()
            .HasIndex(u => new { u.AuthProvider, u.ProviderUserId }).IsUnique()
            .HasFilter("[ProviderUserId] IS NOT NULL");

        // Group
        b.Entity<Group>()
            .HasIndex(g => g.InviteCode).IsUnique();

        b.Entity<Group>()
            .HasOne(g => g.Leader)
            .WithMany()
            .HasForeignKey(g => g.LeaderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // GroupMembership
        b.Entity<GroupMembership>()
            .HasIndex(gm => new { gm.GroupId, gm.UserId }).IsUnique();

        b.Entity<GroupMembership>()
            .HasOne(gm => gm.Group)
            .WithMany(g => g.Memberships)
            .HasForeignKey(gm => gm.GroupId);

        b.Entity<GroupMembership>()
            .HasOne(gm => gm.User)
            .WithMany(u => u.GroupMemberships)
            .HasForeignKey(gm => gm.UserId);

        // Restaurant
        b.Entity<Restaurant>()
            .HasOne(r => r.CreatedBy)
            .WithMany()
            .HasForeignKey(r => r.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Meatup
        b.Entity<Meatup>()
            .HasOne(m => m.CreatedBy)
            .WithMany(u => u.CreatedMeatups)
            .HasForeignKey(m => m.CreatedByUserId);

        b.Entity<Meatup>()
            .HasOne(m => m.Group)
            .WithMany(g => g.Meatups)
            .HasForeignKey(m => m.GroupId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Meatup>()
            .HasOne(m => m.Restaurant)
            .WithMany(r => r.Meatups)
            .HasForeignKey(m => m.RestaurantId)
            .OnDelete(DeleteBehavior.SetNull);

        b.Entity<Attendance>()
            .HasIndex(a => new { a.MeatupId, a.UserId }).IsUnique();

        b.Entity<Review>()
            .HasIndex(r => r.OrderId).IsUnique();

        b.Entity<Review>()
            .HasMany(r => r.Photos)
            .WithOne(p => p.Review)
            .HasForeignKey(p => p.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<RestaurantSummary>()
            .HasIndex(s => s.RestaurantName).IsUnique();

        b.Entity<Bill>()
            .HasIndex(bill => bill.MeatupId).IsUnique();

        b.Entity<Payment>()
            .HasIndex(p => new { p.BillId, p.UserId }).IsUnique();

        b.Entity<Bill>()
            .Property(bill => bill.TotalAmount).HasColumnType("TEXT");
        b.Entity<Bill>()
            .Property(bill => bill.SplitAmount).HasColumnType("TEXT");
    }
}
