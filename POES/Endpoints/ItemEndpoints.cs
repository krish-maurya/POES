using FluentValidation;
using POES.DTOs;
using POES.Services;
using System.Security.Claims;

namespace POES.Endpoints;

public static class ItemEndpoints
{
    public static RouteGroupBuilder MapItemEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/items")
                       .RequireAuthorization();

        group.MapGet("/next-code", async (ItemService service) =>
        {
            return Results.Ok(new { itemCode = await service.GetNextCodeAsync() });
        });

        group.MapGet("/", async (ItemService service, ClaimsPrincipal user) =>
        {
            if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } supplierCode)
            {
                return Results.Ok(await service.GetItemsBySupplierAsync(supplierCode));
            }

            return Results.Ok(await service.GetAllAsync());
        });

        group.MapGet("/{itemCode}", async (string itemCode, ItemService service, ClaimsPrincipal user) =>
        {
            var item = await service.GetByIdAsync(itemCode);

            if (item is null)
                return Results.NotFound();

            if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } supplierCode && item.SupplierCode != supplierCode)
                return Results.Forbid();

            return Results.Ok(item);
        });

        group.MapPost("/", async (ItemCreateDto dto, ItemService service, IValidator<ItemCreateDto> validator, ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("Supplier") && !user.IsInRole("Admin"))
                return Results.Forbid();

            if (user.IsInRole("Supplier"))
            {
                var supplierCode = user.FindFirstValue("SupplierCode");
                if (string.IsNullOrWhiteSpace(supplierCode))
                    return Results.Forbid();

                dto = dto with { SupplierCode = supplierCode };
            }

            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var item = await service.CreateAsync(dto);

            return Results.Created(
                $"/api/items/{item.ItemCode}",
                item);
        });

        group.MapPut("/{itemCode}", async (string itemCode, ItemUpdateDto dto, ItemService service, IValidator<ItemUpdateDto> validator, ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("Supplier") && !user.IsInRole("Admin"))
                return Results.Forbid();

            var existing = await service.GetByIdAsync(itemCode);
            if (existing is null)
                return Results.NotFound();

            if (user.IsInRole("Supplier"))
            {
                var supplierCode = user.FindFirstValue("SupplierCode");
                if (string.IsNullOrWhiteSpace(supplierCode) || existing.SupplierCode != supplierCode)
                    return Results.Forbid();

                dto = dto with { SupplierCode = supplierCode };
            }

            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            bool updated = await service.UpdateAsync(itemCode, dto);

            return updated
                ? Results.NoContent()
                : Results.NotFound();
        });

        group.MapDelete("/{itemCode}", async (string itemCode, ItemService service, ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("Supplier") && !user.IsInRole("Admin"))
                return Results.Forbid();

            var existing = await service.GetByIdAsync(itemCode);
            if (existing is null)
                return Results.NotFound();

            if (user.IsInRole("Supplier"))
            {
                var supplierCode = user.FindFirstValue("SupplierCode");
                if (string.IsNullOrWhiteSpace(supplierCode) || existing.SupplierCode != supplierCode)
                    return Results.Forbid();
            }

            bool deleted = await service.DeleteAsync(itemCode);

            return deleted
                ? Results.NoContent()
                : Results.NotFound();
        });

        group.MapGet("/by-supplier/{supplierCode}", async (string supplierCode, ItemService service, ClaimsPrincipal user) =>
        {
            if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } ownSupplierCode && ownSupplierCode != supplierCode)
                return Results.Forbid();

            return Results.Ok(
                await service.GetItemsBySupplierAsync(supplierCode));
        });


        return group;
    }
}
