using FluentValidation;
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;
using POES.Enums;

namespace POES.Validators;

public class POLineCreateRequest
{
    public string OrderNumber { get; set; } = string.Empty;
    public POLineCreateDto Dto { get; set; } = null!;
}

public class POLineCreateValidator : AbstractValidator<POLineCreateRequest>
{
    private readonly AppDbContext _db;

    public POLineCreateValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.Dto.ItemCode)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(37)
            .Must(code => code == code.ToUpperInvariant())
                .WithMessage("Item code must be uppercase.")
            .MustAsync(async (code, ct) =>
                await _db.Items.AnyAsync(i => i.ItemCode == code, ct))
                .WithMessage("Item does not exist.");

        RuleFor(x => x.Dto.OrderedQuantity)
            .GreaterThan(0)
            .WithMessage("Ordered quantity must be greater than zero.");

        RuleFor(x => x.OrderNumber)
            .NotEmpty()
            .MustAsync(async (orderNumber, ct) =>
            {
                var header = await _db.POHeaders
                    .FirstOrDefaultAsync(h => h.OrderNumber == orderNumber, ct);

                return header != null &&
                       header.OrderStatus != OrderStatus.Delivered;
            })
            .WithMessage("Cannot modify a Delivered purchase order.");

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
                !await _db.POLines.AnyAsync(
                    l => l.OrderNumber == req.OrderNumber &&
                         l.ItemCode == req.Dto.ItemCode,
                    ct))
            .WithMessage("This item already exists on this purchase order.")
            .WithName(nameof(POLineCreateDto.ItemCode));

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
            {
                var header = await _db.POHeaders
                    .FirstOrDefaultAsync(h => h.OrderNumber == req.OrderNumber, ct);

                var item = await _db.Items
                    .FirstOrDefaultAsync(i => i.ItemCode == req.Dto.ItemCode, ct);

                if (header == null || item == null)
                    return true;

                return header.SupplierCode == item.SupplierCode;
            })
            .WithMessage("This item does not belong to the supplier on this purchase order.")
            .WithName(nameof(POLineCreateDto.ItemCode));
    }
}
public class POLineUpdateRequest
{
    public string OrderNumber { get; set; } = string.Empty;
    public byte Position { get; set; }
    public POLineUpdateDto Dto { get; set; } = null!;
}

public class POLineUpdateValidator : AbstractValidator<POLineUpdateRequest>
{
    private readonly AppDbContext _db;

    public POLineUpdateValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.Dto.OrderedQuantity)
            .GreaterThan(0)
            .WithMessage("Ordered quantity must be greater than zero.");

        RuleFor(x => x.Dto.Price)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Price cannot be negative.");

        RuleFor(x => x.OrderNumber)
            .NotEmpty()
            .MustAsync(async (orderNumber, ct) =>
            {
                var header = await _db.POHeaders
                    .FirstOrDefaultAsync(h => h.OrderNumber == orderNumber, ct);

                return header != null &&
                       header.OrderStatus != OrderStatus.Delivered;
            })
            .WithMessage("Cannot modify a line on a Delivered purchase order.");

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
                await _db.POLines.AnyAsync(
                    l => l.OrderNumber == req.OrderNumber &&
                         l.Position == req.Position,
                    ct))
            .WithMessage("Purchase order line not found.")
            .WithName(nameof(POLineUpdateRequest.Position));

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
            {
                var arrivedQuantity = await _db.Arrivals
                    .Where(a => a.OrderNumber == req.OrderNumber &&
                                a.Position == req.Position)
                    .SumAsync(a => (double?)a.ArrivedQuantity, ct);

                return req.Dto.OrderedQuantity >= (arrivedQuantity ?? 0);
            })
            .WithMessage("Ordered quantity cannot be less than the arrived quantity for this line.")
            .WithName(nameof(POLineUpdateDto.OrderedQuantity));
    }
}
