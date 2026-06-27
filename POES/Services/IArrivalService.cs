using POES.DTOs;

namespace POES.Services;

public interface IArrivalService
{
    Task<ArrivalReadDto?> GetAsync(string orderNumber, byte position);
    Task<ArrivalReadDto> AddArrivalAsync(ArrivalCreateDto dto);
    Task<bool> UpdateArrivalAsync(string orderNumber, byte position, ArrivalUpdateDto dto);
    Task<bool> DeleteArrivalAsync(string orderNumber, byte position);
    Task<double> GetPendingQtyAsync(string orderNumber, byte position);
}