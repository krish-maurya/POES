using FluentValidation;
using POES.DTOs;
using POES.Services;
using POES.Validators;

namespace POES.Endpoints;

public static class ArrivalEndpoints
{
    public static RouteGroupBuilder MapArrivalEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/purchaseorders/{orderNo}/lines/{position}/arrivals")
                       .RequireAuthorization();

        // GET the single arrival for this line (at most 1 row exists — composite PK)
        group.MapGet("/", async (string orderNo, byte position, IArrivalService service) =>
        {
            var arrival = await service.GetAsync(orderNo, position);

            return arrival is null
                ? Results.NotFound()
                : Results.Ok(arrival);
        });

        // GET pending quantity for this line
        group.MapGet("/pending", async (string orderNo, byte position, IArrivalService service) =>
        {
            try
            {
                var pending = await service.GetPendingQtyAsync(orderNo, position);
                return Results.Ok(new { pendingQuantity = pending });
            }
            catch (InvalidOperationException ex)
            {
                return Results.NotFound(new { error = ex.Message });
            }
        });

        // Add arrival
        group.MapPost("/", async (string orderNo, byte position, ArrivalCreateDto dto, IArrivalService service, IValidator<ArrivalCreateDto> validator) =>
        {
            // route values must match the body — DTO already carries OrderNumber/Position,
            // so cross-check them against the route to avoid mismatched requests
            if (dto.OrderNumber != orderNo || dto.Position != position)
                return Results.BadRequest(new { error = "Route and body OrderNumber/Position must match." });

            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            try
            {
                var arrival = await service.AddArrivalAsync(dto);
                return Results.Created(
                    $"/api/purchaseorders/{orderNo}/lines/{position}/arrivals",
                    arrival);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        // Update arrival (only if not Delivered)
        group.MapPut("/", async (string orderNo, byte position, ArrivalUpdateDto dto, IArrivalService service, IValidator<ArrivalUpdateRequest> validator) =>
        {
            var request = new ArrivalUpdateRequest { OrderNumber = orderNo, Position = position, Dto = dto };

            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            try
            {
                bool updated = await service.UpdateArrivalAsync(orderNo, position, dto);
                return updated ? Results.NoContent() : Results.NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        // Delete arrival (only if not Delivered)
        group.MapDelete("/", async (string orderNo, byte position, IArrivalService service) =>
        {
            try
            {
                bool deleted = await service.DeleteArrivalAsync(orderNo, position);
                return deleted ? Results.NoContent() : Results.NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        return group;
    }
}
