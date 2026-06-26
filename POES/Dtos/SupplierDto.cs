namespace POES.DTOs;

public record SupplierCreateDto(
    string SupplierCode,
    string Description,
    string? Address,
    string? ZipCode,
    string? Town,
    string? Country,
    string? Phone,
    string? Fax
);

public record SupplierUpdateDto(
    string Description,
    string? Address,
    string? ZipCode,
    string? Town,
    string? Country,
    string? Phone,
    string? Fax
);

public record SupplierReadDto(
    string SupplierCode,
    string Description,
    string? Address,
    string? ZipCode,
    string? Town,
    string? Country,
    string? Phone,
    string? Fax
);