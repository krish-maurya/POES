using AutoMapper;
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;
using POES.Entities;
using POES.Enums;

namespace POES.Services;

public class ItemService(AppDbContext db, IMapper mapper, NumberGeneratorService numberGenerator)
{
    private readonly AppDbContext _db = db;
    private readonly IMapper _mapper = mapper;
    private readonly NumberGeneratorService _numberGenerator = numberGenerator;

    // Get all items
    public async Task<IEnumerable<ItemReadDto>> GetAllAsync()
    {
        var items = await _db.Items.ToListAsync();

        return _mapper.Map<List<ItemReadDto>>(items);
    }

    // Get single item
    public async Task<ItemReadDto?> GetByIdAsync(string itemCode)
    {
        var item = await _db.Items.FindAsync(itemCode);

        if (item is null)
            return null;

        return _mapper.Map<ItemReadDto>(item);
    }

    // Create item
    public async Task<ItemReadDto> CreateAsync(ItemCreateDto dto)
    {
        var item = _mapper.Map<Item>(dto);

        if (item.Packing == PackingType.No) item.NetWeight = item.GrossWeight;

        item.InventoryOnHand = 0;
        item.InventoryOnOrder = 0;
        item.InventoryAllocated = 0;

        _db.Items.Add(item);

        await _db.SaveChangesAsync();

        return _mapper.Map<ItemReadDto>(item);
    }

    public Task<string> GetNextCodeAsync() => _numberGenerator.GenerateAsync("ITM");

    // Update item
    public async Task<bool> UpdateAsync(string itemCode, ItemUpdateDto dto)
    {
        var item = await _db.Items.FindAsync(itemCode);

        if (item is null)
            return false;
        _mapper.Map(dto, item);

        if (item.Packing == PackingType.No)
            item.NetWeight = item.GrossWeight;

        await _db.SaveChangesAsync();

        return true;
    }

    // Delete item
    public async Task<bool> DeleteAsync(string itemCode)
    {
        var item = await _db.Items.FindAsync(itemCode);

        if (item is null)
            return false;

        // Business Rule:
        // Don't allow deletion if inventory exists
        if (item.InventoryOnHand > 0 ||
            item.InventoryOnOrder > 0 ||
            item.InventoryAllocated > 0)
        {
            throw new Exception(
                "Cannot delete item because inventory exists.");
        }

        _db.Items.Remove(item);
        await _db.SaveChangesAsync();

        return true;
    }

    // Items for a supplier (PO Line zoom)
    public async Task<IEnumerable<ItemReadDto>> GetItemsBySupplierAsync(string supplierCode)
    {
        var items = await _db.Items
            .Where(item => item.SupplierCode == supplierCode).ToListAsync();

        return _mapper.Map<List<ItemReadDto>>(items);
    }
}
