using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using POES.DTOs;
using POES.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace POES.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (
            RegisterDto dto,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IValidator<RegisterDto> validator) =>
        {
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
                return Results.ValidationProblem(validationResult.ToDictionary());

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                SupplierCode = dto.Role == "Supplier" ? dto.SupplierCode : null
            };

            var result = await userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return Results.BadRequest(result.Errors);

            if (!await roleManager.RoleExistsAsync(dto.Role))
                await roleManager.CreateAsync(new IdentityRole(dto.Role));

            await userManager.AddToRoleAsync(user, dto.Role);

            return Results.Ok(new { message = "Registered successfully", role = dto.Role });
        })
        .AllowAnonymous();

        group.MapPost("/login", async (
            LoginDto dto,
            UserManager<ApplicationUser> userManager,
            IConfiguration config) =>
        {
            var user = await userManager.FindByEmailAsync(dto.Email);
            if (user is null || !await userManager.CheckPasswordAsync(user, dto.Password))
                return Results.Unauthorized();

            var roles = await userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email!)
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            if (!string.IsNullOrEmpty(user.SupplierCode))
                claims.Add(new Claim("SupplierCode", user.SupplierCode));

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return Results.Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                roles
            });
        })
        .AllowAnonymous();

        return group;
    }
}