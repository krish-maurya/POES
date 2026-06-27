using POES.Enums;

namespace POES.DTOs;

public record POHeaderCreateDto(
<<<<<<< HEAD
    string SupplierCode
);

public record POHeaderUpdateDto(
    string SupplierCode
=======
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
>>>>>>> origin/main
);

public record POHeaderReadDto(
    string OrderNumber,
    string SupplierCode,
    DateTime OrderDate,
    DateTime? ArrivalDate,
    OrderStatus OrderStatus
);