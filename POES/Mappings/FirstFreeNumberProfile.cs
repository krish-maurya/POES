using AutoMapper;
using POES.DTOs;
using POES.Entities;

namespace POES.Mappings;

public class FirstFreeNumberProfile : Profile
{
    public FirstFreeNumberProfile()
    {
        CreateMap<FirstFreeNumberCreateDto, FirstFreeNumber>();

        CreateMap<FirstFreeNumber, FirstFreeNumberReadDto>();
    }
}