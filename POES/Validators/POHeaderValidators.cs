using FluentValidation;
<<<<<<< HEAD
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;
=======
using POES.DTOs;
using POES.Data;
using Microsoft.EntityFrameworkCore;
>>>>>>> origin/main

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
<<<<<<< HEAD
            .Must(code => code == code.ToUpperInvariant())
                .WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) =>
                await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
                .WithMessage("Supplier does not exist.");

        RuleFor(x => x)
            .MustAsync(async (_, ct) =>
=======
            .Must(code => code == code.ToUpperInvariant()).WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) => await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
            .WithMessage("Supplier does not exist.");

        RuleFor(x => x.ArrivalDate)
            .Null().WithMessage("Arrival Date can only be modified by the application.");

        RuleFor(x => x.OrderStatus)
            .Equal(POES.Enums.OrderStatus.OrderEntry)
            .WithMessage("Order status cannot be modified by user.");

        RuleFor(x => x)
            .MustAsync(async (dto, ct) =>
>>>>>>> origin/main
            {
                var activeParam = await _db.Parameters
                    .OrderByDescending(p => p.SeqNo)
                    .FirstOrDefaultAsync(ct);

<<<<<<< HEAD
                return activeParam != null &&
                       !string.IsNullOrWhiteSpace(activeParam.NumberGroupPurchaseOrder);
=======
                return activeParam != null && !string.IsNullOrEmpty(activeParam.NumberGroupPurchaseOrder);
>>>>>>> origin/main
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
<<<<<<< HEAD
            .Must(code => code == code.ToUpperInvariant())
                .WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) =>
                await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
                .WithMessage("Supplier does not exist.");
=======
            .Must(code => code == code.ToUpperInvariant()).WithMessage("Supplier code must be uppercase.")
            .MustAsync(async (code, ct) => await _db.Suppliers.AnyAsync(s => s.SupplierCode == code, ct))
            .WithMessage("Supplier does not exist.");

        RuleFor(x => x.ArrivalDate)
            .Null().WithMessage("Arrival Date can only be modified by the application.");

        RuleFor(x => x.OrderStatus)
            .Equal(POES.Enums.OrderStatus.OrderEntry)
            .WithMessage("Order status cannot be modified by user.");
>>>>>>> origin/main
    }
}

public class POHeaderUpdateValidator : AbstractValidator<POHeaderUpdateRequest>
{
    private readonly AppDbContext _db;

    public POHeaderUpdateValidator(AppDbContext db)
    {
        _db = db;

<<<<<<< HEAD
        RuleFor(x => x.Dto)
            .SetValidator(new POHeaderUpdateDtoValidator(db));
=======
        RuleFor(x => x.Dto).SetValidator(new POHeaderUpdateDtoValidator(db));
>>>>>>> origin/main

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
            {
                var header = await _db.POHeaders
<<<<<<< HEAD
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
=======
                    .FirstOrDefaultAsync(h => h.OrderNumber == req.OrderNumber, ct);
                if (header is null) return true;
                if (header.SupplierCode == req.Dto.SupplierCode) return true;

                return !await _db.POLines.AnyAsync(l => l.OrderNumber == req.OrderNumber, ct);
            })
            .WithMessage("Supplier cannot be modified once purchase order lines are present.")
            .WithName("SupplierCode");
    }
}
>>>>>>> origin/main
