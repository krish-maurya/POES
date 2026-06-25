namespace POES.Entities;

public class POLine
{
    public required string OrderNumber { get; set; }
    public byte Position { get; set; }
    public required string Item { get; set; }
    public double Price { get; set; }
    public double OrderedQuantity { get; set; }
}