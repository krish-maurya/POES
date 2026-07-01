using Microsoft.EntityFrameworkCore;
using POES.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace POES.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Item> Items { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<POHeader> POHeaders { get; set; }
    public DbSet<POLine> POLines { get; set; }
    public DbSet<Arrival> Arrivals { get; set; }
    public DbSet<Parameter> Parameters { get; set; }
    public DbSet<FirstFreeNumber> FirstFreeNumbers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Item
        modelBuilder.Entity<Item>(e =>
        {
            e.HasKey(x => x.ItemCode);
            e.Property(x => x.ItemCode).HasMaxLength(37);
            e.Property(x => x.Price).IsRequired();
            e.HasIndex(x => new { x.SupplierCode, x.ItemCode });

            e.HasOne(x => x.Supplier).WithMany(s => s.Items)
             .HasForeignKey(x => x.SupplierCode);
        });

        // Supplier
        modelBuilder.Entity<Supplier>(e =>
        {
            e.HasKey(x => x.SupplierCode);
            e.Property(x => x.SupplierCode).HasMaxLength(9);
        });

        // POHeader
        modelBuilder.Entity<POHeader>(e =>
        {
            e.HasKey(x => x.OrderNumber);
            e.Property(x => x.OrderNumber).HasMaxLength(9);
            e.HasOne(x => x.Supplier).WithMany(s => s.POHeaders)
             .HasForeignKey(x => x.SupplierCode);
        });

        // POLine
        modelBuilder.Entity<POLine>(e =>
        {
            e.Property(x => x.OrderNumber).HasMaxLength(9);
            e.HasKey(x => new { x.OrderNumber, x.Position });
            e.HasIndex(x => new { x.OrderNumber, x.ItemCode }).IsUnique();
            e.HasOne(x => x.Header).WithMany(h => h.Lines)
             .HasForeignKey(x => x.OrderNumber)
             .OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.Item).WithMany(i => i.POLines)
             .HasForeignKey(x => x.ItemCode)
             .OnDelete(DeleteBehavior.NoAction);
        });

        // Arrival
        modelBuilder.Entity<Arrival>(e =>
        {
            e.HasKey(x => new { x.OrderNumber, x.Position });
            e.HasOne(x => x.Line).WithMany(l => l.Arrivals)
             .HasForeignKey(x => new { x.OrderNumber, x.Position })
             .OnDelete(DeleteBehavior.NoAction);
        });

        // Parameter
        modelBuilder.Entity<Parameter>(e =>
        {
            e.HasKey(x => x.SeqNo);
            e.Property(x => x.SeqNo).ValueGeneratedOnAdd();
        });

        // FirstFreeNumber
        modelBuilder.Entity<FirstFreeNumber>(e =>
        {
            e.HasKey(x => x.NumberGroup);
            e.Property(x => x.NumberGroup).HasMaxLength(3);
            e.Property(x => x.FirstFreeNo).HasDefaultValue(1L);
        });

        modelBuilder.Entity<FirstFreeNumber>().HasData(
            new FirstFreeNumber
            {
                NumberGroup = "SUP",
                Description = "Vendor",
                FirstFreeNo = 1
            },
            new FirstFreeNumber
            {
                NumberGroup = "PO",
                Description = "PurOrd",
                FirstFreeNo = 1
            }
        );

        modelBuilder.Entity<Parameter>().HasData(
            new Parameter
            {
                SeqNo = 1,
                NumberGroupSupplier = "SUP",
                NumberGroupPurchaseOrder = "PO",
                CreatedByLogin = "System",
                CreationDate = new DateTime(2026, 6, 27),
                ModifiedByLogin = string.Empty,
                ModificationDate = null
            }
        );
    }
}