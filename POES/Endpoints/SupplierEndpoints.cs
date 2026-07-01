using FluentValidation;
using POES.DTOs;
using POES.Services;

namespace POES.Endpoints;

public static class SupplierEndpoints
{
    public static RouteGroupBuilder MapSupplierEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/suppliers")
                       .RequireAuthorization(policy => policy.RequireRole("Company"));

        group.MapGet("/", async (SupplierService service) =>
        {
            return Results.Ok(await service.GetAllAsync());
        });

        group.MapGet("/{supplierCode}", async (string supplierCode, SupplierService service) =>
        {
            var supplier = await service.GetByIdAsync(supplierCode);

            return supplier is null
                ? Results.NotFound()
                : Results.Ok(supplier);
        });

        group.MapPost("/", async (SupplierCreateDto dto, SupplierService service, IValidator<SupplierCreateDto> validator) =>
        {
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            try
            {
                var supplier = await service.CreateAsync(dto);

                return Results.Created(
                    $"/api/suppliers/{supplier.SupplierCode}",
                    supplier);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        group.MapPut("/{supplierCode}", async (string supplierCode, SupplierUpdateDto dto, SupplierService service, IValidator<SupplierUpdateDto> validator) =>
        {
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            bool updated = await service.UpdateAsync(supplierCode, dto);

            return updated
                ? Results.NoContent()
                : Results.NotFound();
        });

        group.MapDelete("/{supplierCode}", async (string supplierCode, SupplierService service) =>
        {
            try
            {
                bool deleted = await service.DeleteAsync(supplierCode);

                return deleted
                    ? Results.NoContent()
                    : Results.NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        return group;
    }
}
