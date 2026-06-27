using AutoMapper;
using POES.DTOs;
using POES.Entities;

namespace POES.Mappings;

public class POProfile : Profile
{
    public POProfile()
    {
        // Header
        CreateMap<POHeaderCreateDto, POHeader>();
        CreateMap<POHeaderUpdateDto, POHeader>();
        CreateMap<POHeader, POHeaderReadDto>();

        // Line
        CreateMap<POLineCreateDto, POLine>();
        CreateMap<POLineUpdateDto, POLine>();
        CreateMap<POLine, POLineReadDto>();
    }
}