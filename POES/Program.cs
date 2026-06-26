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

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<ItemService>();

builder.Services.AddScoped<IValidator<ItemCreateDto>, ItemCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ItemUpdateDto>, ItemUpdateDtoValidator>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapItemEndpoints();

app.Run();
