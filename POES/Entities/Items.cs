using POES.Enums;

namespace POES.Entities;

public class Items
{
    public string Item { get; set; } = string.Empty;

    public required string Description { get; set; }

    public string? Variety { get; set; }

    public PackingType Packing { get; set; }

    public double GrossWeight { get; set; }

    public double NetWeight { get; set; }

    public string SupplierId { get; set; } = string.Empty;
    public required string Supplier { get; set; }

    public double Price { get; set; }

    public string? ItemText { get; set; }

    public double InventoryOnHand { get; set; }

    public double InventoryOnOrder { get; set; }

    public double InventoryAllocatedForSales { get; set; }
}