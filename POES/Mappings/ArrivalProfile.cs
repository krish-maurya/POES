using AutoMapper;
using POES.DTOs;
using POES.Entities;

namespace POES.Mappings;

public class ArrivalProfile : Profile
{
    public ArrivalProfile()
    {
        CreateMap<Arrival, ArrivalReadDto>();
    }
}