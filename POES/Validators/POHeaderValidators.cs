using FluentValidation;
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;

namespace POES.Validators;

public class POHeaderCreateDtoValidator : AbstractValidator<POHeaderCreateDto>
{
    private readonly AppDbContext _db;

    public POHeaderCreateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.SupplierCode)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(9)
            .Must(code => code == code.ToUpperInvariant())
                .WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) =>
                await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
                .WithMessage("Supplier does not exist.");

        RuleFor(x => x)
            .MustAsync(async (_, ct) =>
            {
                var activeParam = await _db.Parameters
                    .OrderByDescending(p => p.SeqNo)
                    .FirstOrDefaultAsync(ct);

                return activeParam != null &&
                       !string.IsNullOrWhiteSpace(activeParam.NumberGroupPurchaseOrder);
            })
            .WithMessage("No active Number Group configured for Purchase Order. Entry is blocked.");
    }
}

public class POHeaderUpdateRequest
{
    public string OrderNumber { get; set; } = string.Empty;
    public POHeaderUpdateDto Dto { get; set; } = null!;
}

public class POHeaderUpdateDtoValidator : AbstractValidator<POHeaderUpdateDto>
{
    private readonly AppDbContext _db;

    public POHeaderUpdateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.SupplierCode)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(9)
            .Must(code => code == code.ToUpperInvariant())
                .WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) =>
                await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
                .WithMessage("Supplier does not exist.");
    }
}

public class POHeaderUpdateValidator : AbstractValidator<POHeaderUpdateRequest>
{
    private readonly AppDbContext _db;

    public POHeaderUpdateValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.Dto)
            .SetValidator(new POHeaderUpdateDtoValidator(db));

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
            {
                var header = await _db.POHeaders
                    .Include(h => h.Lines)
                    .FirstOrDefaultAsync(h => h.OrderNumber == req.OrderNumber, ct);

                if (header == null)
                    return true;

                if (header.SupplierCode == req.Dto.SupplierCode)
                    return true;

                return !header.Lines.Any();
            })
            .WithMessage("Supplier cannot be modified once purchase order lines are present.")
            .WithName(nameof(POHeaderUpdateDto.SupplierCode));
    }
}