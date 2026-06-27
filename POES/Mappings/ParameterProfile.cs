using AutoMapper;
using POES.DTOs;
using POES.Entities;

namespace POES.Mappings;

public class ParameterProfile : Profile
{
    public ParameterProfile()
    {
        CreateMap<ParameterCreateDto, Parameter>();

        CreateMap<ParameterUpdateDto, Parameter>();

        CreateMap<Parameter, ParameterReadDto>();
    }
}