using FluentValidation;
using POES.DTOs;
using POES.Services;

namespace POES.Endpoints;

public static class ItemEndpoints
{
    public static RouteGroupBuilder MapItemEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/items")
                       .RequireAuthorization();

        group.MapGet("/", async (ItemService service) =>
        {
            return Results.Ok(await service.GetAllAsync());
        });

        group.MapGet("/{itemCode}", async (string itemCode, ItemService service) =>
        {
            var item = await service.GetByIdAsync(itemCode);

            return item is null
                ? Results.NotFound()
                : Results.Ok(item);
        });

        group.MapPost("/", async (ItemCreateDto dto, ItemService service, IValidator<ItemCreateDto> validator) =>
        {

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

        group.MapPut("/{itemCode}", async (string itemCode, ItemUpdateDto dto, ItemService service, IValidator<ItemUpdateDto> validator) =>
        {   
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

        group.MapDelete("/{itemCode}", async (string itemCode, ItemService service) =>
        {
            bool deleted = await service.DeleteAsync(itemCode);

            return deleted
                ? Results.NoContent()
                : Results.NotFound();
        });

        group.MapGet("/by-supplier/{supplierCode}", async (string supplierCode, ItemService service) =>
        {
            return Results.Ok(
                await service.GetItemsBySupplierAsync(supplierCode));
        });


        return group;
    }
}
