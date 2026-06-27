namespace POES.DTOs;

public record ArrivalCreateDto(
    string OrderNumber,
    byte Position,
    double ArrivedQuantity,
    DateTime? ArrivalDate
);

public record ArrivalUpdateDto(
    double ArrivedQuantity,
    DateTime ArrivalDate
);

public record ArrivalReadDto(
    string OrderNumber,
    byte Position,
    double ArrivedQuantity,
    DateTime ArrivalDate
);
