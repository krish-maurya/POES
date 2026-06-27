using Microsoft.EntityFrameworkCore;
using AutoMapper;
using POES.Data;
using POES.DTOs;
using POES.Entities;
using POES.Enums;

namespace POES.Services;

public class ArrivalService : IArrivalService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public ArrivalService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ArrivalReadDto?> GetAsync(string orderNumber, byte position)
    {
        var arrival = await _db.Arrivals
            .FirstOrDefaultAsync(a => a.OrderNumber == orderNumber && a.Position == position);

        return arrival is null ? null : _mapper.Map<ArrivalReadDto>(arrival);
    }

    // RULE 7c — update inventory on insert
    // RULE 7d — ArrivalDate defaults to today
    // RULE 7e/7g — recompute order status
    // RULE 7h — blocked if order already Delivered (also checked by validator, re-checked here for safety)
    public async Task<ArrivalReadDto> AddArrivalAsync(ArrivalCreateDto dto)
    {
        var line = await _db.POLines
            .Include(l => l.Header)
            .Include(l => l.Item)
            .FirstOrDefaultAsync(l => l.OrderNumber == dto.OrderNumber && l.Position == dto.Position);

        if (line is null)
            throw new InvalidOperationException("Purchase order line not found.");

        if (line.Header!.OrderStatus == OrderStatus.Delivered)
            throw new InvalidOperationException("Cannot add an arrival to a Delivered purchase order.");

        var existing = await _db.Arrivals
            .AnyAsync(a => a.OrderNumber == dto.OrderNumber && a.Position == dto.Position);
        if (existing)
            throw new InvalidOperationException("An arrival already exists for this line. Use update instead.");

        var arrival = new Arrival
        {
            OrderNumber = dto.OrderNumber,
            Position = dto.Position,
            ArrivedQuantity = dto.ArrivedQuantity,
            ArrivalDate = dto.ArrivalDate ?? DateTime.UtcNow // RULE 7d
        };

        _db.Arrivals.Add(arrival);

        // RULE 7c — Inventory on hand increases, on order decreases
        line.Item!.InventoryOnHand += dto.ArrivedQuantity;
        line.Item.InventoryOnOrder -= dto.ArrivedQuantity;

        await RecalculateOrderStatusAsync(line.Header, arrival.ArrivalDate);

        await _db.SaveChangesAsync();

        return _mapper.Map<ArrivalReadDto>(arrival);
    }

    // RULE 7c — reverse OLD quantity's inventory effect, apply NEW quantity's effect
    // RULE 7h — blocked if order already Delivered
    public async Task<bool> UpdateArrivalAsync(string orderNumber, byte position, ArrivalUpdateDto dto)
    {
        var arrival = await _db.Arrivals
            .FirstOrDefaultAsync(a => a.OrderNumber == orderNumber && a.Position == position);

        if (arrival is null) return false;

        var line = await _db.POLines
            .Include(l => l.Header)
            .Include(l => l.Item)
            .FirstOrDefaultAsync(l => l.OrderNumber == orderNumber && l.Position == position);

        if (line is null)
            throw new InvalidOperationException("Purchase order line not found.");

        if (line.Header!.OrderStatus == OrderStatus.Delivered)
            throw new InvalidOperationException("Cannot modify an arrival on a Delivered purchase order.");

        var oldQuantity = arrival.ArrivedQuantity;
        var difference = dto.ArrivedQuantity - oldQuantity;

        // Apply only the DIFFERENCE, not the full new value (same pattern as
        // POLine quantity updates — preserve consistency with Item totals)
        line.Item!.InventoryOnHand += difference;
        line.Item.InventoryOnOrder -= difference;

        arrival.ArrivedQuantity = dto.ArrivedQuantity;
        arrival.ArrivalDate = dto.ArrivalDate;

        await RecalculateOrderStatusAsync(line.Header, arrival.ArrivalDate);

        await _db.SaveChangesAsync();
        return true;
    }

    // RULE 7h — blocked if order already Delivered
    public async Task<bool> DeleteArrivalAsync(string orderNumber, byte position)
    {
        var arrival = await _db.Arrivals
            .FirstOrDefaultAsync(a => a.OrderNumber == orderNumber && a.Position == position);

        if (arrival is null) return false;

        var line = await _db.POLines
            .Include(l => l.Header)
            .Include(l => l.Item)
            .FirstOrDefaultAsync(l => l.OrderNumber == orderNumber && l.Position == position);

        if (line is null)
            throw new InvalidOperationException("Purchase order line not found.");

        if (line.Header!.OrderStatus == OrderStatus.Delivered)
            throw new InvalidOperationException("Cannot delete an arrival on a Delivered purchase order.");

        // Reverse the inventory effect entirely
        line.Item!.InventoryOnHand -= arrival.ArrivedQuantity;
        line.Item.InventoryOnOrder += arrival.ArrivedQuantity;

        _db.Arrivals.Remove(arrival);

        await RecalculateOrderStatusAsync(line.Header, null);

        await _db.SaveChangesAsync();
        return true;
    }

    // RULE 7f — Pending Quantity = Ordered Quantity − Already Arrived Quantity
    // (singular subtraction, NOT a sum — composite PK allows only one Arrival row per line)
    public async Task<double> GetPendingQtyAsync(string orderNumber, byte position)
    {
        var line = await _db.POLines
            .FirstOrDefaultAsync(l => l.OrderNumber == orderNumber && l.Position == position);

        if (line is null)
            throw new InvalidOperationException("Purchase order line not found.");

        var arrival = await _db.Arrivals
            .FirstOrDefaultAsync(a => a.OrderNumber == orderNumber && a.Position == position);

        var arrivedQty = arrival?.ArrivedQuantity ?? 0;
        return line.OrderedQuantity - arrivedQty;
    }

    // RULE 7e/7g — one line delivered → OrderDelivery; ALL lines delivered → Delivered
    // RULE 7h — when Delivered, copy the arrival date onto the Header
    private async Task RecalculateOrderStatusAsync(POHeader header, DateTime? latestArrivalDate)
    {
        var lines = await _db.POLines
            .Where(l => l.OrderNumber == header.OrderNumber)
            .ToListAsync();

        var arrivals = await _db.Arrivals
            .Where(a => a.OrderNumber == header.OrderNumber)
            .ToListAsync();

        bool anyArrived = arrivals.Any(a => a.ArrivedQuantity > 0);
        bool allFullyArrived = lines.Count > 0 && lines.All(l =>
        {
            var arrival = arrivals.FirstOrDefault(a => a.Position == l.Position);
            return arrival != null && arrival.ArrivedQuantity >= l.OrderedQuantity;
        });

        if (allFullyArrived)
        {
            header.OrderStatus = OrderStatus.Delivered;
            header.ArrivalDate = latestArrivalDate ?? DateTime.UtcNow; // RULE 7h
        }
        else if (anyArrived)
        {
            header.OrderStatus = OrderStatus.OrderDelivery;
        }
        else
        {
            header.OrderStatus = OrderStatus.OrderEntry;
        }
    }
}