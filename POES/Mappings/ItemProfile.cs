using AutoMapper;
using POES.DTOs;
using POES.Entities;

namespace POES.Mappings;

public class ItemProfile : Profile
{
    public ItemProfile()
    {
        CreateMap<Item, ItemReadDto>();

        CreateMap<ItemCreateDto, Item>();

        CreateMap<ItemUpdateDto, Item>();
    }
}