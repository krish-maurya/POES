using POES.Enums;

namespace POES.Entities;

public class Item
{
    public required string ItemCode { get; set; }

    public required string Description { get; set; }

    public string? Variety { get; set; }

    public PackingType Packing { get; set; }

    public double GrossWeight { get; set; }

    public double NetWeight { get; set; }

    public required string SupplierCode { get; set; }

    public double Price { get; set; }

    public string? ItemText { get; set; }

    public double InventoryOnHand { get; set; }

    public double InventoryOnOrder { get; set; }

    public double InventoryAllocated { get; set; }

    public Supplier? Supplier { get; set; }

    public ICollection<POLine> POLines { get; set; } = new List<POLine>();
}