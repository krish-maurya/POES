using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;
using POES.Entities;

namespace POES.Services;

public class FirstFreeNumberService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public FirstFreeNumberService(
        AppDbContext db,
        IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }
    public async Task<List<FirstFreeNumberReadDto>> GetAllAsync()
  {
    return await _db.FirstFreeNumbers
        .OrderBy(f => f.NumberGroup)
        .ProjectTo<FirstFreeNumberReadDto>(_mapper.ConfigurationProvider)
        .ToListAsync();
  }
    public async Task<FirstFreeNumberReadDto?> GetByIdAsync(string numberGroup)
  {
    var firstFreeNumber = await _db.FirstFreeNumbers.FindAsync(numberGroup);

    return firstFreeNumber is null
        ? null
        : _mapper.Map<FirstFreeNumberReadDto>(firstFreeNumber);
  }
  public async Task<FirstFreeNumberReadDto> CreateAsync(FirstFreeNumberCreateDto dto)
  {
    var entity = _mapper.Map<FirstFreeNumber>(dto);

    _db.FirstFreeNumbers.Add(entity);

    await _db.SaveChangesAsync();

    return _mapper.Map<FirstFreeNumberReadDto>(entity);
  }
  public async Task<bool> UpdateAsync(string numberGroup, FirstFreeNumberCreateDto dto)
 {
    var entity = await _db.FirstFreeNumbers.FindAsync(numberGroup);

    if (entity is null)
        return false;

    _mapper.Map(dto, entity);

    // Prevent changing the primary key
    entity.NumberGroup = numberGroup;

    await _db.SaveChangesAsync();

    return true;
  }
}