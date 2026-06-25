namespace POES.Entities;

public class Arrival
{
    public string OrderNumber { get; set; } = string.Empty; 

    public byte Position { get; set; } 

    public double ArrivedQuantity { get; set; } 

    public DateTime ArrivalDate { get; set; } 

}