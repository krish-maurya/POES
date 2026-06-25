namespace POES.Entities;

public class Parameter
{
    public long SeqNo { get; set; }

    public string NumberGroupSupplier { get; set; } = string.Empty; 

    public string NumberGroupPurchaseOrder { get; set; } = string.Empty; 

    public string CreatedByLogin { get; set; } = string.Empty; 

    public DateTime CreationDate { get; set; } 

    public string ModifiedByLogin { get; set; } = string.Empty; 

    public DateTime? ModificationDate { get; set; } 
}