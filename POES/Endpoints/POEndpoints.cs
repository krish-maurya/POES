using AutoMapper;
using FluentValidation;
using POES.DTOs;
using POES.Entities;
using POES.Services;
using POES.Validators;

namespace POES.Endpoints;

public static class POEndpoints
{
    public static RouteGroupBuilder MapPOEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/purchaseorders")
                       .WithTags("Purchase Orders");

        // Get all purchase orders
        group.MapGet("/", GetAll);

        // Get one purchase order
        group.MapGet("/{orderNo}", GetById);

        // Create purchase order
        group.MapPost("/", Create);

        // Update purchase order
        group.MapPut("/{orderNo}", Update);

        // Add line
        group.MapPost("/{orderNo}/lines", AddLine);

        // Update line
        group.MapPut("/{orderNo}/lines/{position}", UpdateLine);

        // Delete line
        group.MapDelete("/{orderNo}/lines/{position}", DeleteLine);

        //get total
        group.MapGet("/{orderNo}/total", GetTotal);

        return group;
    }


    static async Task<IResult> GetAll(
        POservice service,
        IMapper mapper)
    {
        var headers = await service.GetAllHeadersAsync();

        return Results.Ok(
            mapper.Map<IEnumerable<POHeaderReadDto>>(headers));
    }

    static async Task<IResult> GetById(
        string orderNo,
        POservice service,
        IMapper mapper)
    {
        var header = await service.GetHeaderAsync(orderNo);

        if (header is null)
            return Results.NotFound();

        return Results.Ok(
            mapper.Map<POHeaderReadDto>(header));
    }

    static async Task<IResult> Create(
    POHeaderCreateDto dto,
    POservice service,
    IMapper mapper,
    IValidator<POHeaderCreateDto> validator)
    {
        var validation = await validator.ValidateAsync(dto);

        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var entity = mapper.Map<POHeader>(dto);

        var created = await service.CreateHeaderAsync(entity);

        return Results.Created(
            $"/purchaseorders/{created.OrderNumber}",
            mapper.Map<POHeaderReadDto>(created));
    }

    static async Task<IResult> Update(
    string orderNo,
    POHeaderUpdateDto dto,
    POservice service,
    IMapper mapper,
    IValidator<POHeaderUpdateRequest> validator)
    {
        var request = new POHeaderUpdateRequest
        {
            OrderNumber = orderNo,
            Dto = dto
        };

        var validation = await validator.ValidateAsync(request);

        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var entity = mapper.Map<POHeader>(dto);
        entity.OrderNumber = orderNo;

        var updated = await service.UpdateHeaderAsync(entity);

        return Results.Ok(
            mapper.Map<POHeaderReadDto>(updated));
    }


    static async Task<IResult> AddLine(
    string orderNo,
    POLineCreateDto dto,
    POservice service,
    IMapper mapper,
    IValidator<POLineCreateRequest> validator)
    {
        var request = new POLineCreateRequest
        {
            OrderNumber = orderNo,
            Dto = dto
        };

        var validation = await validator.ValidateAsync(request);

        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var entity = mapper.Map<POLine>(dto);
        entity.OrderNumber = orderNo;

        var created = await service.AddLineAsync(entity);

        return Results.Ok(
            mapper.Map<POLineReadDto>(created));
    }

    static async Task<IResult> UpdateLine(
    string orderNo,
    byte position,
    POLineUpdateDto dto,
    POservice service,
    IMapper mapper,
    IValidator<POLineUpdateRequest> validator)
    {
        var request = new POLineUpdateRequest
        {
            OrderNumber = orderNo,
            Position = position,
            Dto = dto
        };

        var validation = await validator.ValidateAsync(request);

        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var entity = mapper.Map<POLine>(dto);
        entity.OrderNumber = orderNo;
        entity.Position = position;

        var updated = await service.UpdateLineAsync(entity);

        return Results.Ok(
            mapper.Map<POLineReadDto>(updated));
    }

    static async Task<IResult> DeleteLine(
        string orderNo,
        byte position,
        POservice service)
    {
        await service.DeleteLineAsync(orderNo, position);

        return Results.NoContent();
    }

    static async Task<IResult> GetTotal(
    string orderNo,
    POservice service)
    {
        var total = await service.GetTotalOrderAmountAsync(orderNo);

        return Results.Ok(total);
    }
}