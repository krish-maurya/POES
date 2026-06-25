namespace POES.Entities;

public class PurchaseOrderHeader
{
    public long SeqNo { get; set; }

    public string OrderNumber { get; set; }

    public string Supplier { get; set; }

    public DateOnly OrderDate { get; set; }

    public DateOnly ArrivalDate { get; set; }

    public string OrderStatus { get; set; } 

    public string CreatedByLogin { get; set; } 

    public DateOnly CreationDate { get; set; }

    public string ModifiedByLogin { get; set; } 

    public DateOnly ModificationDate { get; set; }
}