using Microsoft.EntityFrameworkCore;
using POES.Data;

var builder = WebApplication.CreateBuilder(args);

var connString = builder.Configuration.GetConnectionString("DefaultConnectionString");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connString));

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
