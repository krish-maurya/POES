using POES.Enums;

namespace POES.DTOs;

public record POHeaderCreateDto(
    string SupplierCode,
    DateTime OrderDate,
    DateTime? ArrivalDate,
    OrderStatus OrderStatus
);

public record POHeaderUpdateDto(
    string SupplierCode,
    DateTime OrderDate,
    DateTime? ArrivalDate,
    OrderStatus OrderStatus
);

public record POHeaderReadDto(
    string OrderNumber,
    string SupplierCode,
    DateTime OrderDate,
    DateTime? ArrivalDate,
    OrderStatus OrderStatus
);