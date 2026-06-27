using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.Entities;
using POES.Enums;

namespace POES.Services;

public class POservice(AppDbContext db , NumberGeneratorService numberGen)
{
    private readonly AppDbContext _db = db;
    private readonly NumberGeneratorService _numberGen = numberGen;

    public async Task<POHeader?> GetHeaderAsync(string orderNo)
    {
        return await _db.POHeaders
                    .Include( h => h.Supplier)
                    .Include( h => h.Lines)
                        .ThenInclude(l => l.Item)
                    .Include( h => h.Lines)
                        .ThenInclude(l => l.Arrivals)
                    .FirstOrDefaultAsync( h => h.OrderNumber == orderNo);    
    }

    public async Task<IEnumerable<POHeader>> GetAllHeadersAsync()
    {
        return await _db.POHeaders
            .Include(h => h.Supplier)
            .OrderByDescending(h => h.OrderDate)
            .ToListAsync();
    }

    //CREATE a new Purchase Order Header
    public async Task<POHeader> CreateHeaderAsync(POHeader header)
    {
        // Step 1 – Get the active Parameters to find the PO number group
        var activeParam = await _db.Parameters
            .OrderByDescending(p => p.SeqNo)
            .FirstOrDefaultAsync();
 
        if (activeParam == null)
            throw new InvalidOperationException(
                "No Parameter record found. Please set up Parameters first.");
 
        if (string.IsNullOrWhiteSpace(activeParam.NumberGroupPurchaseOrder))
            throw new InvalidOperationException(
                "Number Group for Purchase Orders is not set in Parameters. " +
                "Please update Parameters (e.g. set 'ORD') before creating a Purchase Order.");
 
        // Step 2 – Auto-generate the Order Number  e.g. "ORD000001"
        header.OrderNumber = await _numberGen.GenerateAsync(
            activeParam.NumberGroupPurchaseOrder.Trim().ToUpper());
 
        // Step 3 – Default the order date to TODAY (user cannot change this default)
        header.OrderDate = DateTime.UtcNow;
 
        // Step 4 – Status always starts at OrderEntry (system sets this, not user)
        header.OrderStatus = OrderStatus.OrderEntry;
 
        // Step 5 – Normalise
        header.SupplierCode = header.SupplierCode.ToUpper();
 
        _db.POHeaders.Add(header);
        await _db.SaveChangesAsync();
        return header;
    }

    //UPDATE a Purchase Order Header
    public async Task<POHeader> UpdateHeaderAsync(POHeader header)
    {
        var existing = await _db.POHeaders
            .Include(h => h.Lines)
            .FirstOrDefaultAsync(h => h.OrderNumber == header.OrderNumber);
 
        if (existing == null)
            throw new KeyNotFoundException($"Purchase Order '{header.OrderNumber}' not found.");
 
        // RULE: Cannot change the supplier once lines have been added
        if (existing.SupplierCode != header.SupplierCode.ToUpper())
        {
            bool hasLines = existing.Lines.Any();
            if (hasLines)
                throw new InvalidOperationException(
                    $"Cannot change the Supplier on Order '{header.OrderNumber}' " +
                    $"because it already has {existing.Lines.Count} order line(s). " +
                    $"Delete the lines first if you need to change the supplier.");
        }
 
        // RULE: Status is NOT updated here — it's managed automatically by the system
        // (only ArrivalService and this service's internal method update it)
        existing.SupplierCode = header.SupplierCode.ToUpper();
 
        await _db.SaveChangesAsync();
        return existing;
    }

    // LINE OPERATIONS

    //ADD a new line to a Purchase Order
    public async Task<POLine> AddLineAsync(POLine line)
    {   
        // Load the header (we need the supplier code for validation)
        var header = await _db.POHeaders
            .Include(h => h.Lines)
            .FirstOrDefaultAsync(h => h.OrderNumber == line.OrderNumber);

        if (header == null)
            throw new KeyNotFoundException(
                $"Purchase Order '{line.OrderNumber}' not found.");

        //RULE: Cannot add lines to a delivered order
        if(header.OrderStatus == OrderStatus.Delivered)
            throw new InvalidOperationException(
                $"Order '{line.OrderNumber}' is fully Delivered. No changes are allowed.");

        // Load the item
        line.ItemCode = line.ItemCode.ToUpper();
        var item = await _db.Items.FindAsync(line.ItemCode);
 
        if (item == null)
            throw new KeyNotFoundException($"Item '{line.ItemCode}' not found.");
 
        // RULE: The item must belong to the same supplier as the order header
        if (item.SupplierCode != header.SupplierCode)
            throw new InvalidOperationException(
                $"Item '{line.ItemCode}' belongs to Supplier '{item.SupplierCode}', " +
                $"but this order is for Supplier '{header.SupplierCode}'. " +
                $"You can only add items from the order's supplier.");
 
        // RULE: Same item cannot appear twice in the same order
        bool itemAlreadyOnOrder = header.Lines.Any(l => l.ItemCode == line.ItemCode);
        if (itemAlreadyOnOrder)
            throw new InvalidOperationException(
                $"Item '{line.ItemCode}' is already on this order (line exists). " +
                $"Each item can only appear once per purchase order.");
 
        // AUTO: Default price from the item's purchase price
        line.Price = item.Price;
 
        // AUTO: Set the next position number (1, 2, 3, ...)
        line.Position = header.Lines.Any()
            ? (byte)(header.Lines.Max(l => l.Position) + 1)
            : (byte)1;
 
        // Save the line
        _db.POLines.Add(line);
 
        // INVENTORY UPDATE: The ordered quantity is now "on order" in the item table
        item.InventoryOnOrder += line.OrderedQuantity;
 
        await _db.SaveChangesAsync();
        return line;       
    }

    //UPDATE an existing line (mainly to change ordered quantity)
    public async Task<POLine> UpdateLineAsync(POLine line)
    {
        var existing = await _db.POLines
            .Include(l => l.Item)
            .FirstOrDefaultAsync(l =>
                l.OrderNumber == line.OrderNumber &&
                l.Position    == line.Position);
 
        if (existing == null)
            throw new KeyNotFoundException(
                $"Order line (Order: {line.OrderNumber}, Position: {line.Position}) not found.");
 
        // Check order not delivered
        var header = await _db.POHeaders.FindAsync(line.OrderNumber);
        if (header?.OrderStatus == OrderStatus.Delivered)
            throw new InvalidOperationException(
                $"Order '{line.OrderNumber}' is Delivered. No changes are allowed.");
 
        // INVENTORY UPDATE: Calculate the DIFFERENCE and adjust accordingly
        // Example: was 100, now changing to 150 → add 50 to InventoryOnOrder
        //          was 100, now changing to  60 → subtract 40 from InventoryOnOrder
        double oldQty   = existing.OrderedQuantity;
        double newQty   = line.OrderedQuantity;
        double qtyDelta = newQty - oldQty;   // positive = more ordered, negative = less ordered
 
        if (existing.Item != null)
            existing.Item.InventoryOnOrder += qtyDelta;
 
        // Update the line fields (price can also be changed)
        existing.OrderedQuantity = line.OrderedQuantity;
        existing.Price           = line.Price;
 
        await _db.SaveChangesAsync();
        return existing;
    }

    //DELETE a line from a Purchase Order
    public async Task DeleteLineAsync(string orderNo, byte position)
    {
        var line = await _db.POLines
            .Include(l => l.Item)
            .Include(l => l.Arrivals)
            .FirstOrDefaultAsync(l =>
                l.OrderNumber == orderNo &&
                l.Position    == position);
 
        if (line == null)
            throw new KeyNotFoundException(
                $"Order line (Order: {orderNo}, Position: {position}) not found.");
 
        // Check order not delivered
        var header = await _db.POHeaders.FindAsync(orderNo);
        if (header?.OrderStatus == OrderStatus.Delivered)
            throw new InvalidOperationException(
                $"Order '{orderNo}' is Delivered. No changes are allowed.");
 
        // INVENTORY UPDATE: Remove the ordered quantity from the item's "on order" count
        if (line.Item != null)
            line.Item.InventoryOnOrder -= line.OrderedQuantity;
 
        _db.POLines.Remove(line);
        await _db.SaveChangesAsync();
    }

    // Total Order Amount = sum of (qty × price) across all lines
    public async Task<double> GetTotalOrderAmountAsync(string orderNo)
    {
        return await _db.POLines
            .Where(l => l.OrderNumber == orderNo)
            .SumAsync(l => l.OrderedQuantity * l.Price);
    }

    // Returns true if supplier can be changed (no lines exist yet)
    public async Task<bool> CanModifySupplierAsync(string orderNo)
    {
        bool hasLines = await _db.POLines.AnyAsync(l => l.OrderNumber == orderNo);
        return !hasLines;
    }
 
    // ═════════════════════════════════════════════════════════════════════════
    // INTERNAL: Update the order status based on delivery progress
    // Called by ArrivalService after every arrival is saved
    // ═════════════════════════════════════════════════════════════════════════
    internal async Task RecalculateOrderStatusAsync(string orderNo)
    {
        var header = await _db.POHeaders
            .Include(h => h.Lines)
                .ThenInclude(l => l.Arrivals)
            .FirstOrDefaultAsync(h => h.OrderNumber == orderNo);
 
        if (header == null) return;
 
        bool anyDelivery  = false;
        bool allDelivered = true;
 
        foreach (var line in header.Lines)
        {
            double totalArrived = line.Arrivals.Sum(a => a.ArrivedQuantity);
 
            if (totalArrived > 0)
                anyDelivery = true;
 
            if (totalArrived < line.OrderedQuantity)
                allDelivered = false;
        }
 
        // No lines at all = stays at OrderEntry
        if (!header.Lines.Any())
        {
            header.OrderStatus = OrderStatus.OrderEntry;
        }
        else if (allDelivered)
        {
            // Every single line is fully delivered
            header.OrderStatus  = OrderStatus.Delivered;
            header.ArrivalDate  = DateTime.UtcNow;  // stamp the final delivery date
        }
        else if (anyDelivery)
        {
            // At least one line has some delivery
            header.OrderStatus = OrderStatus.OrderDelivery;
        }
        else
        {
            header.OrderStatus = OrderStatus.OrderEntry;
        }
 
        await _db.SaveChangesAsync();
    }
}