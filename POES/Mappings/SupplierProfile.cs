using AutoMapper;
using POES.DTOs;
using POES.Entities;

namespace POES.Mappings;

public class SupplierProfile : Profile
{
    public SupplierProfile()
    {
        CreateMap<SupplierCreateDto, Supplier>();
        CreateMap<SupplierUpdateDto, Supplier>();
        CreateMap<Supplier, SupplierReadDto>();
    }
}