namespace POES.Entities;

public class Suppliers
{
    public required string Supplier { get; set; }      
    public required string Description { get; set; }   
    public required string Address { get; set; }       
    public required string ZipCode { get; set; }       
    public required string Town { get; set; }          
    public required string Country { get; set; }       
    public required string Phone { get; set; }         
    public string? Fax { get; set; }                   
}