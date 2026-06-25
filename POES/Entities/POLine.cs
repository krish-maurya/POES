namespace POES.Entities;

public class POLine
{
    public required string OrderNumber { get; set; }
    
    public byte Position { get; set; }

    public required string ItemCode { get; set; }

    public double Price { get; set; }

    public double OrderedQuantity { get; set; }

    public POHeader? Header { get; set; }

    public Item? Item { get; set; }

    public ICollection<Arrival> Arrivals { get; set; } = new List<Arrival>();
}