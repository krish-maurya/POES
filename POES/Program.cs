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

// For swagger checking
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<NumberGeneratorService>();
// For Items
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<ItemService>();

builder.Services.AddScoped<IValidator<ItemCreateDto>, ItemCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ItemUpdateDto>, ItemUpdateDtoValidator>();

// For Supplier 
builder.Services.AddScoped<SupplierService>();

builder.Services.AddScoped<IValidator<SupplierCreateDto>, SupplierCreateDtoValidator>();
builder.Services.AddScoped<IValidator<SupplierUpdateDto>, SupplierUpdateDtoValidator>();

// For Parameter
builder.Services.AddScoped<ParameterService>();
builder.Services.AddScoped<IValidator<ParameterCreateDto>, ParameterCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ParameterUpdateDto>, ParameterUpdateDtoValidator>();
var app = builder.Build();

//for swagger testing only on developer local mode!!
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



// Main Endpoints:
app.MapGet("/", () => "Hello World!");
app.MapItemEndpoints();
app.MapSupplierEndpoints();
app.MapParameterEndpoints();

app.Run();
