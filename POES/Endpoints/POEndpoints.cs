using AutoMapper;
using FluentValidation;
using POES.DTOs;
using POES.Entities;
using POES.Services;
using POES.Validators;
using System.Security.Claims;

namespace POES.Endpoints;

public static class POEndpoints
{
    public static RouteGroupBuilder MapPOEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/purchaseorders")
                       .RequireAuthorization()
                       .WithTags("Purchase Orders");

        // Get all purchase orders
        group.MapGet("/", GetAll);

        // Get one purchase order
        group.MapGet("/{orderNo}", GetById);

        // Get lines for a purchase order
        group.MapGet("/{orderNo}/lines", GetLines);

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
        IMapper mapper,
        ClaimsPrincipal user)
    {
        var headers = await service.GetAllHeadersAsync();

        if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } supplierCode)
        {
            headers = headers.Where(h => h.SupplierCode == supplierCode).ToList();
        }

        return Results.Ok(
            mapper.Map<IEnumerable<POHeaderReadDto>>(headers));
    }

    static async Task<IResult> GetById(
        string orderNo,
        POservice service,
        IMapper mapper,
        ClaimsPrincipal user)
    {
        var header = await service.GetHeaderAsync(orderNo);

        if (header is null)
            return Results.NotFound();

        if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } supplierCode && header.SupplierCode != supplierCode)
            return Results.Forbid();

        return Results.Ok(
            mapper.Map<POHeaderReadDto>(header));
    }

    static async Task<IResult> GetLines(
        string orderNo,
        POservice service,
        IMapper mapper,
        ClaimsPrincipal user)
    {
        var header = await service.GetHeaderAsync(orderNo);

        if (header is null)
            return Results.NotFound();

        if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } supplierCode && header.SupplierCode != supplierCode)
            return Results.Forbid();

        var lines = await service.GetLinesAsync(orderNo);

        return Results.Ok(mapper.Map<IEnumerable<POLineReadDto>>(lines));
    }

    static async Task<IResult> Create(
    POHeaderCreateDto dto,
    POservice service,
    IMapper mapper,
    IValidator<POHeaderCreateDto> validator,
    ClaimsPrincipal user)
    {
        if (!user.IsInRole("Company") && !user.IsInRole("Admin"))
            return Results.Forbid();

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
    IValidator<POHeaderUpdateRequest> validator,
    ClaimsPrincipal user)
    {
        if (!user.IsInRole("Company") && !user.IsInRole("Admin"))
            return Results.Forbid();

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
    IValidator<POLineCreateRequest> validator,
    ClaimsPrincipal user)
    {
        if (!user.IsInRole("Company") && !user.IsInRole("Admin"))
            return Results.Forbid();

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
    IValidator<POLineUpdateRequest> validator,
    ClaimsPrincipal user)
    {
        if (!user.IsInRole("Company") && !user.IsInRole("Admin"))
            return Results.Forbid();

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
        POservice service,
        ClaimsPrincipal user)
    {
        if (!user.IsInRole("Company") && !user.IsInRole("Admin"))
            return Results.Forbid();

        await service.DeleteLineAsync(orderNo, position);

        return Results.NoContent();
    }

    static async Task<IResult> GetTotal(
        string orderNo,
        POservice service,
        ClaimsPrincipal user)
    {
        var header = await service.GetHeaderAsync(orderNo);

        if (header is null)
            return Results.NotFound();

        if (user.IsInRole("Supplier") && user.FindFirstValue("SupplierCode") is { } supplierCode && header.SupplierCode != supplierCode)
            return Results.Forbid();

        var total = await service.GetTotalOrderAmountAsync(orderNo);

        return Results.Ok(total);
    }
}
