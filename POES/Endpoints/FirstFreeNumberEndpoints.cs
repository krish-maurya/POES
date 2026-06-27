using FluentValidation;
using POES.DTOs;
using POES.Services;

namespace POES.Endpoints;

public static class FirstFreeNumberEndpoints
{
    public static RouteGroupBuilder MapFirstFreeNumberEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/firstfreenumbers");

        group.MapGet("/", async (FirstFreeNumberService service) =>
    {
    return Results.Ok(await service.GetAllAsync());
    });
     
       group.MapGet("/{numberGroup}", async (
    string numberGroup,
    FirstFreeNumberService service) =>
  {
    var firstFreeNumber = await service.GetByIdAsync(numberGroup);

    return firstFreeNumber is null
        ? Results.NotFound()
        : Results.Ok(firstFreeNumber);
  });

  group.MapPost("/", async (
    FirstFreeNumberCreateDto dto,
    FirstFreeNumberService service,
    IValidator<FirstFreeNumberCreateDto> validator) =>
{
    var validationResult = await validator.ValidateAsync(dto);

    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    try
    {
        var firstFreeNumber = await service.CreateAsync(dto);

        return Results.Created(
            $"/api/firstfreenumbers/{firstFreeNumber.NumberGroup}",
            firstFreeNumber);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new
        {
            error = ex.Message
        });
    }
});

group.MapPut("/{numberGroup}", async (
    string numberGroup,
    FirstFreeNumberCreateDto dto,
    FirstFreeNumberService service,
    IValidator<FirstFreeNumberCreateDto> validator) =>
{
    var validationResult = await validator.ValidateAsync(dto);

    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    bool updated = await service.UpdateAsync(numberGroup, dto);

    return updated
        ? Results.NoContent()
        : Results.NotFound();
});
        return group;
    }
}