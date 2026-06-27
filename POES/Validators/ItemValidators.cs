using FluentValidation;
using POES.DTOs;
using POES.Data;
using POES.Enums;
using Microsoft.EntityFrameworkCore;

namespace POES.Validators;

public class ItemCreateDtoValidator : AbstractValidator<ItemCreateDto>
{
    private readonly AppDbContext _db;

    public ItemCreateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.ItemCode)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(37)
            .Must(c => c == c.ToUpperInvariant()).WithMessage("Item code must be uppercase.");

        RuleFor(x => x.ItemCode)
            .MustAsync(async (code, ct) => !await _db.Items.AnyAsync(i => i.ItemCode == code, ct))
            .WithMessage("This Item code already exists.");

        RuleFor(x => x.Description).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Variety).MaximumLength(15);
        RuleFor(x => x.Packing).IsInEnum();

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price is mandatory and must be greater than zero.");

        RuleFor(x => x.GrossWeight).GreaterThanOrEqualTo(0);
        RuleFor(x => x.NetWeight).GreaterThanOrEqualTo(0);

        RuleFor(x => x)
            .Must(x => x.NetWeight <= x.GrossWeight)
            .WithMessage("Net weight must be less than or equal to Gross weight.")
            .WithName("NetWeight");

        RuleFor(x => x)
            .Must(x => x.Packing == PackingType.Yes || x.NetWeight == x.GrossWeight)
            .WithMessage("Net weight must be the same as Gross weight when packing is not applicable.")
            .WithName("NetWeight");

        RuleFor(x => x.SupplierCode)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(9)
            .Must(code => code == code!.ToUpperInvariant()).WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) => await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
            .WithMessage("Supplier does not exist.");
    }
}

public class ItemUpdateDtoValidator : AbstractValidator<ItemUpdateDto>
{
    private readonly AppDbContext _db;

    public ItemUpdateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.Description).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Variety).MaximumLength(15);
        RuleFor(x => x.Packing).IsInEnum();
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price is mandatory and must be greater than zero.");
        RuleFor(x => x.GrossWeight).GreaterThanOrEqualTo(0);
        RuleFor(x => x.NetWeight).GreaterThanOrEqualTo(0);

        RuleFor(x => x)
            .Must(x => x.NetWeight <= x.GrossWeight)
            .WithMessage("Net weight must be less than or equal to Gross weight.")
            .WithName("NetWeight");

        RuleFor(x => x)
            .Must(x => x.Packing == PackingType.Yes || x.NetWeight == x.GrossWeight)
            .WithMessage("Net weight must be the same as Gross weight when packing is not applicable.")
            .WithName("NetWeight");

        RuleFor(x => x.SupplierCode)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(9)
            .Must(code => code == code!.ToUpperInvariant()).WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) => await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
            .WithMessage("Supplier does not exist.");
    }
}
