using FluentValidation;
using POES.DTOs;
using POES.Data;
using Microsoft.EntityFrameworkCore;

namespace POES.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    private readonly AppDbContext _db;

    public RegisterDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.")
            .Must(p => p.Any(char.IsDigit))
            .WithMessage("Password must contain at least one digit.")
            .Must(p => p.Any(char.IsLower))
            .WithMessage("Password must contain at least one lowercase letter.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(r => r == "Company" || r == "Supplier")
            .WithMessage("Role must be either 'Company' or 'Supplier'.");

        // SupplierCode required when Role = Supplier
        RuleFor(x => x.SupplierCode)
            .NotEmpty()
            .When(x => x.Role == "Supplier")
            .WithMessage("SupplierCode is required when registering as a Supplier.");

        // SupplierCode must NOT be provided when Role = Company
        RuleFor(x => x.SupplierCode)
            .Must(code => string.IsNullOrEmpty(code))
            .When(x => x.Role == "Company")
            .WithMessage("SupplierCode should not be provided for Company role.");

        // SupplierCode must reference a real Supplier
        RuleFor(x => x.SupplierCode)
            .MustAsync(async (code, ct) =>
                string.IsNullOrEmpty(code) ||
                await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
            .When(x => x.Role == "Supplier")
            .WithMessage("SupplierCode does not match any existing Supplier.");

        // No duplicate email
        RuleFor(x => x.Email)
            .MustAsync(async (email, ct) =>
                !await _db.Users.AnyAsync(u => u.Email == email, ct))
            .WithMessage("An account with this email already exists.");
    }
}