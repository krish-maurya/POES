namespace POES.DTOs;

public record RegisterDto(string Email, string Password, string Role, string? SupplierCode);
public record LoginDto(string Email, string Password);