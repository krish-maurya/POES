namespace POES.DTOs;

public record ParameterCreateDto(
    string? NumberGroupSupplier,
    string? NumberGroupPurchaseOrder,
    string CreatedByLogin
);

public record ParameterUpdateDto(
    string? NumberGroupSupplier,
    string? NumberGroupPurchaseOrder
);

public record ParameterReadDto(
    long SeqNo,
    string? NumberGroupSupplier,
    string? NumberGroupPurchaseOrder,
    string CreatedByLogin,
    DateTime CreationDate,
    string? ModifiedByLogin,
    DateTime? ModificationDate
);