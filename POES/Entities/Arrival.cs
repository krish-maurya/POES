namespace POES.Entities;

public class Arrival
{
    public string OrderNumber { get; set; } = string.Empty;

    public byte Position { get; set; }

    public double ArrivedQuantity { get; set; }

    public DateOnly ArrivalDate { get; set; } = DateOnly.FromDateTime(DateTime.Today);

    public POLine? Line { get; set; }

}