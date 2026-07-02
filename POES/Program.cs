using Microsoft.EntityFrameworkCore;
using FluentValidation;
using POES.Data;
using POES.Endpoints;
using POES.Services;
using POES.Validators;
using POES.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using POES.Entities;

var builder = WebApplication.CreateBuilder(args);

var connString = builder.Configuration.GetConnectionString("DefaultConnectionString");

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                    return false;

                return uri.Host is "localhost" or "127.0.0.1" ||
                       uri.Host.EndsWith(".ngrok-free.dev", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connString));

// ---------- Swagger, with Bearer token support ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "POES API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste ONLY the raw token here — Swagger adds the 'Bearer ' prefix automatically."
    });

    options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer")] = new List<string>()
    });
});

//mapper
builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddScoped<NumberGeneratorService>();
builder.Services.AddScoped<ItemService>();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<ParameterService>();
builder.Services.AddScoped<FirstFreeNumberService>();
builder.Services.AddScoped<POservice>();
builder.Services.AddScoped<IArrivalService, ArrivalService>();


builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication Config
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Auth Validators
builder.Services.AddScoped<IValidator<RegisterDto>, RegisterDtoValidator>();


//Item Validators 
builder.Services.AddScoped<IValidator<ItemCreateDto>, ItemCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ItemUpdateDto>, ItemUpdateDtoValidator>();

//Supplier Validators 
builder.Services.AddScoped<IValidator<SupplierCreateDto>, SupplierCreateDtoValidator>();
builder.Services.AddScoped<IValidator<SupplierUpdateDto>, SupplierUpdateDtoValidator>();

//Parameter Validators 
builder.Services.AddScoped<IValidator<ParameterCreateDto>, ParameterCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ParameterUpdateDto>, ParameterUpdateDtoValidator>();

//FirstFreeNumber Validators 
builder.Services.AddScoped<IValidator<FirstFreeNumberCreateDto>, FirstFreeNumberCreateDtoValidator>();

// Purchase Order Validators
builder.Services.AddScoped<IValidator<POHeaderCreateDto>, POHeaderCreateDtoValidator>();
builder.Services.AddScoped<IValidator<POHeaderUpdateRequest>, POHeaderUpdateValidator>();

// Purchase Line Validators 
builder.Services.AddScoped<IValidator<POLineCreateRequest>, POLineCreateValidator>();
builder.Services.AddScoped<IValidator<POLineUpdateRequest>, POLineUpdateValidator>();

//Arrival Validators 
builder.Services.AddScoped<IValidator<ArrivalCreateDto>, ArrivalCreateDtoValidator>();
builder.Services.AddScoped<IValidator<ArrivalUpdateRequest>, ArrivalUpdateValidator>();

var app = builder.Build();

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// endpoints
app.MapAuthEndpoints();
app.MapItemEndpoints();
app.MapSupplierEndpoints();
app.MapParameterEndpoints();
app.MapFirstFreeNumberEndpoints();
app.MapPOEndpoints();
app.MapArrivalEndpoints();

app.Run();
