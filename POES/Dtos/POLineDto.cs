namespace POES.DTOs;

public record POLineCreateDto(
    string ItemCode,
<<<<<<< HEAD
    double OrderedQuantity
=======
    double OrderedQuantity,
    double Price
>>>>>>> origin/main
);

public record POLineUpdateDto(
    double OrderedQuantity,
    double Price
);

public record POLineReadDto(
    string OrderNumber,
    byte Position,
    string ItemCode,
<<<<<<< HEAD
    double OrderedQuantity,
    double Price
=======
    double Price,
    double OrderedQuantity
>>>>>>> origin/main
);

