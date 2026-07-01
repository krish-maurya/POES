namespace POES.Entities;

public class Supplier
{
    public required string SupplierCode { get; set; }
    public required string Description { get; set; }
    public required string Address { get; set; }
    public required string ZipCode { get; set; }
    public required string Town { get; set; }
    public required string Country { get; set; }
    public required string Phone { get; set; }
    public string? Fax { get; set; }
    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<POHeader> POHeaders { get; set; } = new List<POHeader>();
}