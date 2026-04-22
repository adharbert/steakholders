using Microsoft.EntityFrameworkCore;
using SteakholdersMeatup.Models;

namespace SteakholdersMeatup.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Meatup> Meatups => Set<Meatup>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();

        b.Entity<Attendance>()
            .HasIndex(a => new { a.MeatupId, a.UserId }).IsUnique();

        b.Entity<Review>()
            .HasIndex(r => r.OrderId).IsUnique();

        b.Entity<Bill>()
            .HasIndex(bill => bill.MeatupId).IsUnique();

        b.Entity<Payment>()
            .HasIndex(p => new { p.BillId, p.UserId }).IsUnique();

        b.Entity<Meatup>()
            .HasOne(m => m.CreatedBy)
            .WithMany()
            .HasForeignKey(m => m.CreatedByUserId);

        b.Entity<Bill>()
            .Property(bill => bill.TotalAmount).HasColumnType("TEXT");
        b.Entity<Bill>()
            .Property(bill => bill.SplitAmount).HasColumnType("TEXT");
    }
}
