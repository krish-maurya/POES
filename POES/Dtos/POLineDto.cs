namespace POES.DTOs;

public record POLineCreateDto(
    string ItemCode,
    double OrderedQuantity
);

public record POLineUpdateDto(
    double OrderedQuantity,
    double Price
);

public record POLineReadDto(
    string OrderNumber,
    byte Position,
    string ItemCode,
    double OrderedQuantity,
    double Price
);

