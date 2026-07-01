namespace POES.Entities;

public class Employee
{
    public int EmployeeId { get; set; }
    public required string Name { get; set; }
    public required string Designation { get; set; }
    public required string Role { get; set; }   // "Admin" | "Manager" | "User"
    public required string Email { get; set; }  // now required, used for match validation

    public ApplicationUser? User { get; set; }
}