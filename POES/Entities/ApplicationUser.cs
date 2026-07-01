using Microsoft.AspNetCore.Identity;

namespace POES.Entities;

public class ApplicationUser : IdentityUser
{
    public string? SupplierCode { get; set; }
}