namespace POES.Entities;

using POES.Enums;

public class POHeader
{
    public string OrderNumber { get; set; } = string.Empty;

    public required string SupplierCode { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public DateTime? ArrivalDate { get; set; }

    public OrderStatus OrderStatus { get; set; } = OrderStatus.OrderEntry;

    public Supplier? Supplier { get; set; }

    public ICollection<POLine> Lines { get; set; } = new List<POLine>();

}