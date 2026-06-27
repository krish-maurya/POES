using FluentValidation;
using POES.DTOs;
using POES.Data;
using Microsoft.EntityFrameworkCore;

namespace POES.Validators;

public class FirstFreeNumberCreateDtoValidator : AbstractValidator<FirstFreeNumberCreateDto>
{
    private readonly AppDbContext _db;

    public FirstFreeNumberCreateDtoValidator(AppDbContext db)
    {
        _db = db;

        RuleFor(x => x.NumberGroup)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .MaximumLength(3)
            .Must(g => g == g.ToUpperInvariant())
            .WithMessage("Number Group must be uppercase.");

        RuleFor(x => x.NumberGroup)
            .MustAsync(async (group, ct) => !await _db.FirstFreeNumbers.AnyAsync(f => f.NumberGroup == group, ct))
            .WithMessage("This Number Group already exists.");

        RuleFor(x => x.Description).NotEmpty().MaximumLength(6);

        RuleFor(x => x.FirstFreeNo)
            .GreaterThan(0).WithMessage("First Free No must be greater than zero.");
    }
}
