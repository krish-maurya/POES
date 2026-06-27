using FluentValidation;
using POES.DTOs;
using POES.Data;
using POES.Enums;
using Microsoft.EntityFrameworkCore;

namespace POES.Validators;

public class ArrivalCreateDtoValidator : AbstractValidator<ArrivalCreateDto>
{
    private readonly AppDbContext _db;

    public ArrivalCreateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.ArrivedQuantity)
            .GreaterThan(0).WithMessage("Arrived quantity must be greater than zero.");

        RuleFor(x => x)
            .MustAsync(async (dto, ct) =>
                await _db.POLines.AnyAsync(l => l.OrderNumber == dto.OrderNumber && l.Position == dto.Position, ct))
            .WithMessage("Purchase order line not found.")
            .WithName("Position");

        RuleFor(x => x)
            .MustAsync(async (dto, ct) =>
            {
                var header = await _db.POHeaders.FirstOrDefaultAsync(h => h.OrderNumber == dto.OrderNumber, ct);
                return header != null && header.OrderStatus != OrderStatus.Delivered;
            })
            .WithMessage("Cannot add an arrival to a Delivered purchase order.");

        RuleFor(x => x)
            .MustAsync(async (dto, ct) =>
                !await _db.Arrivals.AnyAsync(a => a.OrderNumber == dto.OrderNumber && a.Position == dto.Position, ct))
            .WithMessage("An arrival already exists for this line. Use update instead.");

        RuleFor(x => x)
            .MustAsync(async (dto, ct) =>
            {
                var line = await _db.POLines.FirstOrDefaultAsync(l => l.OrderNumber == dto.OrderNumber && l.Position == dto.Position, ct);
                if (line is null) return true;
                return dto.ArrivedQuantity <= line.OrderedQuantity;
            })
            .WithMessage("Arrived quantity exceeds the ordered quantity for this line.");
    }
}

public class ArrivalUpdateRequest
{
    public string OrderNumber { get; set; } = string.Empty;
    public byte Position { get; set; }
    public ArrivalUpdateDto Dto { get; set; } = null!;
}

public class ArrivalUpdateValidator : AbstractValidator<ArrivalUpdateRequest>
{
    private readonly AppDbContext _db;

    public ArrivalUpdateValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.Dto.ArrivedQuantity)
            .GreaterThan(0).WithMessage("Arrived quantity must be greater than zero.");

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
                await _db.Arrivals.AnyAsync(a => a.OrderNumber == req.OrderNumber && a.Position == req.Position, ct))
            .WithMessage("Arrival not found for this line.");

        RuleFor(x => x.OrderNumber)
            .MustAsync(async (orderNumber, ct) =>
            {
                var header = await _db.POHeaders.FirstOrDefaultAsync(h => h.OrderNumber == orderNumber, ct);
                return header != null && header.OrderStatus != OrderStatus.Delivered;
            })
            .WithMessage("Cannot modify an arrival on a Delivered purchase order.");

        RuleFor(x => x)
            .MustAsync(async (req, ct) =>
            {
                var line = await _db.POLines.FirstOrDefaultAsync(l => l.OrderNumber == req.OrderNumber && l.Position == req.Position, ct);
                if (line is null) return true;
                return req.Dto.ArrivedQuantity <= line.OrderedQuantity;
            })
            .WithMessage("Arrived quantity exceeds the ordered quantity for this line.");
    }
}