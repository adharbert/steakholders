using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SteakholdersMeatup.Data;
using SteakholdersMeatup.Endpoints;
using SteakholdersMeatup.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
var originsConfig = builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173";
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (originsConfig == "*")
        p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    else
        p.WithOrigins(originsConfig.Split(',')).AllowAnyHeader().AllowAnyMethod();
}));

// Database
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=steakholders.db"));

// JWT Auth
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "dev-secret-change-me-please-32chars!!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "steakholders-api",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "steakholders-app",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
        o.Events = new JwtBearerEvents
        {
            OnChallenge = ctx =>
            {
                ctx.HandleResponse();
                ctx.Response.StatusCode = 401;
                ctx.Response.ContentType = "application/json";
                return ctx.Response.WriteAsync("{\"error\":\"Authentication required.\"}");
            }
        };
    });
builder.Services.AddAuthorization();

// Services
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<LlmSummaryService>();
builder.Services.AddScoped<GeocodingService>();
builder.Services.AddScoped<PlacesService>();
builder.Services.AddHttpClient("anthropic");
builder.Services.AddHttpClient("nominatim", c =>
{
    c.DefaultRequestHeaders.Add("User-Agent", "SteakholdersMeatup/1.0 (contact@steakholders.app)");
});
builder.Services.AddHttpClient("googleplaces");

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure wwwroot/uploads directory exists for photo storage
var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "uploads");
Directory.CreateDirectory(uploadsPath);

// Global exception handler
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    await ctx.Response.WriteAsync("{\"error\":\"An unexpected error occurred.\"}");
}));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Run migrations and seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    if (app.Environment.IsDevelopment())
        SeedData.Initialize(db);
}

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// API routes
app.MapAuthEndpoints();
app.MapGroupEndpoints();
app.MapRestaurantEndpoints();
app.MapMeatupEndpoints();
app.MapReviewEndpoints();
app.MapBillEndpoints();
app.MapPublicEndpoints();
app.MapPhotoEndpoints();

app.Run();
