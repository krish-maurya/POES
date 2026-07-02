using FluentValidation;
using POES.DTOs;
using POES.Services;

namespace POES.Endpoints;

public static class ParameterEndpoints
{
    public static RouteGroupBuilder MapParameterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/parameters")
                       .RequireAuthorization(policy => policy.RequireRole("Company", "Admin"));

        group.MapGet("/", async (ParameterService service) =>
    {
    var parameters = await service.GetAllAsync();

    return Results.Ok(parameters);
     });

     group.MapGet("/latest", async (ParameterService service) =>
     {
    var parameter = await service.GetLatestAsync();

    return parameter is null
        ? Results.NotFound()
        : Results.Ok(parameter);
      });

      group.MapGet("/{seqNo:long}", async (long seqNo, ParameterService service) =>
     {
    var parameter = await service.GetBySeqNoAsync(seqNo);

    return parameter is null
        ? Results.NotFound()
        : Results.Ok(parameter);
     });

     group.MapPost("/", async (
    ParameterCreateDto dto,
    ParameterService service,
    IValidator<ParameterCreateDto> validator) =>
   {
    var validationResult = await validator.ValidateAsync(dto);

    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    try
    {
        var parameter = await service.CreateAsync(dto);

        return Results.Created(
            $"/api/parameters/{parameter.SeqNo}",
            parameter);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new
        {
            error = ex.Message
        });
    }
    });

    group.MapPut("/{seqNo:long}", async (
    long seqNo,
    ParameterUpdateDto dto,
    ParameterService service,
    IValidator<ParameterUpdateDto> validator) =>
  {
    var validationResult = await validator.ValidateAsync(dto);

    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    try
    {
        bool updated = await service.UpdateAsync(seqNo, dto);

        return updated
            ? Results.NoContent()
            : Results.NotFound();
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new
        {
            error = ex.Message
        });
    }
   });
        return group;
    }
}
