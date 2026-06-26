using FluentValidation;
using POES.DTOs;
using POES.Data;
using Microsoft.EntityFrameworkCore;

namespace POES.Validators;

public class SupplierCreateDtoValidator : AbstractValidator<SupplierCreateDto>
{
    private readonly AppDbContext _db;

    public SupplierCreateDtoValidator(AppDbContext db)
    {
        _db = db;

        // RuleFor(x => x.SupplierCode)
        //     .Cascade(CascadeMode.Stop)
        //     .NotEmpty()
        //     .MaximumLength(9)
        //     .Must(c => c == c.ToUpperInvariant()).WithMessage("Supplier code must be uppercase.")
        //     .MustAsync(async (code, ct) => !await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
        //     .WithMessage("This Supplier code already exists.");

        RuleFor(x => x.Description).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Address).MaximumLength(30);
        RuleFor(x => x.ZipCode).MaximumLength(10);
        RuleFor(x => x.Town).MaximumLength(30);
        RuleFor(x => x.Country)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(3)
            .Must(c => c == c.ToUpper()).WithMessage("Country must be uppercase.");
        RuleFor(x => x.Phone).MaximumLength(10);
        RuleFor(x => x.Fax).MaximumLength(10);

        RuleFor(x => x)
            .MustAsync(async (dto, ct) =>
            {
                var activeParam = await _db.Parameters
                    .OrderByDescending(p => p.SeqNo)
                    .FirstOrDefaultAsync(ct);

                return activeParam != null && !string.IsNullOrEmpty(activeParam.NumberGroupSupplier);
            })
            .WithMessage("No active Number Group configured for Supplier. Entry is blocked.");
    }
}

public class SupplierUpdateDtoValidator : AbstractValidator<SupplierUpdateDto>
{
    public SupplierUpdateDtoValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Address).MaximumLength(30);
        RuleFor(x => x.ZipCode).MaximumLength(10);
        RuleFor(x => x.Town).MaximumLength(30);
        RuleFor(x => x.Country)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(3)
            .Must(c => c == c.ToUpperInvariant()).WithMessage("Country must be uppercase.");
        RuleFor(x => x.Phone).MaximumLength(10);
        RuleFor(x => x.Fax).MaximumLength(10);
    }
}
