using FluentValidation;
using POES.DTOs;
using POES.Data;
using Microsoft.EntityFrameworkCore;

namespace POES.Validators;

public class ParameterCreateDtoValidator : AbstractValidator<ParameterCreateDto>
{
    private readonly AppDbContext _db;

    public ParameterCreateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.CreatedByLogin).NotEmpty().MaximumLength(16);

        RuleFor(x => x.NumberGroupSupplier)
            .MaximumLength(3)
            .Must(IsBlankOrUppercase).WithMessage("Number Group for Supplier must be uppercase.")
            .MustAsync(async (group, ct) =>
                string.IsNullOrEmpty(group) || await _db.FirstFreeNumbers.AnyAsync(f => f.NumberGroup == group, ct))
            .WithMessage("Number Group for Supplier does not exist.");

        RuleFor(x => x.NumberGroupPurchaseOrder)
            .MaximumLength(3)
            .Must(IsBlankOrUppercase).WithMessage("Number Group for Purchase Order must be uppercase.")
            .MustAsync(async (group, ct) =>
                string.IsNullOrEmpty(group) || await _db.FirstFreeNumbers.AnyAsync(f => f.NumberGroup == group, ct))
            .WithMessage("Number Group for Purchase Order does not exist.");
    }

    private static bool IsBlankOrUppercase(string? value) =>
        string.IsNullOrEmpty(value) || value == value.ToUpperInvariant();
}

public class ParameterUpdateDtoValidator : AbstractValidator<ParameterUpdateDto>
{
    private readonly AppDbContext _db;

    public ParameterUpdateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.NumberGroupSupplier)
            .MaximumLength(3)
            .Must(IsBlankOrUppercase).WithMessage("Number Group for Supplier must be uppercase.")
            .MustAsync(async (group, ct) =>
                string.IsNullOrEmpty(group) || await _db.FirstFreeNumbers.AnyAsync(f => f.NumberGroup == group, ct))
            .WithMessage("Number Group for Supplier does not exist.");

        RuleFor(x => x.NumberGroupPurchaseOrder)
            .MaximumLength(3)
            .Must(IsBlankOrUppercase).WithMessage("Number Group for Purchase Order must be uppercase.")
            .MustAsync(async (group, ct) =>
                string.IsNullOrEmpty(group) || await _db.FirstFreeNumbers.AnyAsync(f => f.NumberGroup == group, ct))
            .WithMessage("Number Group for Purchase Order does not exist.");
    }

    private static bool IsBlankOrUppercase(string? value) =>
        string.IsNullOrEmpty(value) || value == value.ToUpperInvariant();
}
