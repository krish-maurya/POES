using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;
using POES.Entities;

namespace POES.Services;

public class SupplierService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly NumberGeneratorService _numberGenerator;

    public SupplierService(
        AppDbContext db,
        IMapper mapper,
        NumberGeneratorService numberGenerator)
    {
        _db = db;
        _mapper = mapper;
        _numberGenerator = numberGenerator;
    }

    public async Task<List<SupplierReadDto>> GetAllAsync()
    {
        return await _db.Suppliers
            .ProjectTo<SupplierReadDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<SupplierReadDto?> GetByIdAsync(string supplierCode)
    {
        var supplier = await _db.Suppliers.FindAsync(supplierCode);

        return supplier is null
            ? null
            : _mapper.Map<SupplierReadDto>(supplier);
    }

    // RULE 4a–4d
    // Generate SupplierCode automatically using Parameters + FirstFreeNumbers
    public async Task<SupplierReadDto> CreateAsync(SupplierCreateDto dto)
    {
        // Get active Parameters record
        var activeParameter = await _db.Parameters
            .OrderByDescending(p => p.SeqNo)
            .FirstOrDefaultAsync();

        if (activeParameter is null ||
            string.IsNullOrWhiteSpace(activeParameter.NumberGroupSupplier))
        {
            throw new InvalidOperationException(
                "Supplier Number Group is not configured. Entry is blocked.");
        }

        // Generate Supplier Code
        string supplierCode = await _numberGenerator.GenerateAsync(
            activeParameter.NumberGroupSupplier);

        // Map DTO to Entity
        var entity = _mapper.Map<Supplier>(dto);

        // Assign generated Supplier Code
        entity.SupplierCode = supplierCode;

        // Store Country in uppercase (if provided)
        entity.Country = entity.Country?.ToUpper();

        _db.Suppliers.Add(entity);

        await _db.SaveChangesAsync();

        return _mapper.Map<SupplierReadDto>(entity);
    }

    public async Task<bool> UpdateAsync(string supplierCode, SupplierUpdateDto dto)
    {
        var entity = await _db.Suppliers.FindAsync(supplierCode);

        if (entity is null)
            return false;

        _mapper.Map(dto, entity);

        entity.Country = entity.Country?.ToUpper();

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(string supplierCode)
    {
        var entity = await _db.Suppliers.FindAsync(supplierCode);

        if (entity is null)
            return false;

        bool hasItems = await _db.Items
            .AnyAsync(i => i.SupplierCode == supplierCode);

        if (hasItems)
        {
            throw new InvalidOperationException(
                "Cannot delete supplier because it has linked items.");
        }

        _db.Suppliers.Remove(entity);

        await _db.SaveChangesAsync();

        return true;
    }
}