using POES.Enums;

namespace POES.DTOs;

public record ItemCreateDto(
    string ItemCode,
    string Description,
    string? Variety,
    PackingType Packing,
    double GrossWeight,
    double NetWeight,
    string? SupplierCode,
    double Price,
    string? ItemText,
    double InventoryOnHand,
    double InventoryOnOrder,
    double InventoryAllocated
);

public record ItemUpdateDto(
    string Description,
    string? Variety,
    PackingType Packing,
    double GrossWeight,
    double NetWeight,
    string? SupplierCode,
    double Price,
    string? ItemText,
    double InventoryOnHand,
    double InventoryOnOrder,
    double InventoryAllocated
);

public record ItemReadDto(
    string ItemCode,
    string Description,
    string? Variety,
    PackingType Packing,
    double GrossWeight,
    double NetWeight,
    string? SupplierCode,
    double Price,
    string? ItemText,
    double InventoryOnHand,
    double InventoryOnOrder,
    double InventoryAllocated
);

