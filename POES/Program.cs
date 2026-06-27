var builder = WebApplication.CreateBuilder(args);
<<<<<<< Updated upstream
=======

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

//For POServices
builder.Services.AddScoped<POservice>();

builder.Services.AddScoped<IValidator<POHeaderCreateDto>, POHeaderCreateDtoValidator>();
builder.Services.AddScoped<IValidator<POHeaderUpdateRequest>, POHeaderUpdateValidator>();

builder.Services.AddScoped<IValidator<POLineCreateRequest>, POLineCreateValidator>();
builder.Services.AddScoped<IValidator<POLineUpdateRequest>, POLineUpdateValidator>();

>>>>>>> Stashed changes
var app = builder.Build();

app.MapGet("/", () => "Hello World!");
<<<<<<< Updated upstream
=======
app.MapItemEndpoints();
app.MapSupplierEndpoints();
app.MapPOEndpoints();
>>>>>>> Stashed changes

app.Run();
