using POES.Enums;

namespace POES.DTOs;

public record POHeaderCreateDto(
    string SupplierCode
);

public record POHeaderUpdateDto(
    string SupplierCode
);

public record POHeaderReadDto(
    string OrderNumber,
    string SupplierCode,
    DateTime OrderDate,
    DateTime? ArrivalDate,
    OrderStatus OrderStatus
);