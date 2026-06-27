using Microsoft.EntityFrameworkCore;
using FluentValidation;
using POES.Data;
using POES.Endpoints;
using POES.Services;
using POES.Validators;
using POES.DTOs;

var builder = WebApplication.CreateBuilder(args);

var connString = builder.Configuration.GetConnectionString("DefaultConnectionString");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connString));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Services
builder.Services.AddScoped<NumberGeneratorService>();

builder.Services.AddScoped<ItemService>();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<ParameterService>();
builder.Services.AddScoped<FirstFreeNumberService>();
builder.Services.AddScoped<POservice>();

// Item Validators
builder.Services.AddScoped<IValidator<ItemCreateDto>, ItemCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ItemUpdateDto>, ItemUpdateDtoValidator>();

// Supplier Validators
builder.Services.AddScoped<IValidator<SupplierCreateDto>, SupplierCreateDtoValidator>();
builder.Services.AddScoped<IValidator<SupplierUpdateDto>, SupplierUpdateDtoValidator>();

// Parameter Validators
builder.Services.AddScoped<IValidator<ParameterCreateDto>, ParameterCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ParameterUpdateDto>, ParameterUpdateDtoValidator>();

// FirstFreeNumber Validators
builder.Services.AddScoped<IValidator<FirstFreeNumberCreateDto>, FirstFreeNumberCreateDtoValidator>();

// Purchase Order Validators
builder.Services.AddScoped<IValidator<POHeaderCreateDto>, POHeaderCreateDtoValidator>();
builder.Services.AddScoped<IValidator<POHeaderUpdateRequest>, POHeaderUpdateValidator>();

builder.Services.AddScoped<IValidator<POLineCreateRequest>, POLineCreateValidator>();
builder.Services.AddScoped<IValidator<POLineUpdateRequest>, POLineUpdateValidator>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "Hello World!");

// Endpoints
app.MapItemEndpoints();
app.MapSupplierEndpoints();
app.MapParameterEndpoints();
app.MapFirstFreeNumberEndpoints();
app.MapPOEndpoints();

app.Run();