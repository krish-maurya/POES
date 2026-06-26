namespace POES.DTOs;

public record FirstFreeNumberCreateDto(
    string NumberGroup,
    string Description,
    long FirstFreeNo = 1
);

public record FirstFreeNumberReadDto(
    string NumberGroup,
    string Description,
    long FirstFreeNo
);