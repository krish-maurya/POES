namespace POES.Entities;

public class Parameter
{
    public long SeqNo { get; set; }

    public string NumberGroupSupplier { get; set; } = string.Empty;

    public string NumberGroupPurchaseOrder { get; set; } = string.Empty;

    public string CreatedByLogin { get; set; } = string.Empty;

    public DateOnly CreationDate { get; set; }

    public string ModifiedByLogin { get; set; } = string.Empty;

    public DateOnly? ModificationDate { get; set; }
}