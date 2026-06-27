using AutoMapper;
using Microsoft.EntityFrameworkCore;
using POES.Data;
using POES.DTOs;
using AutoMapper.QueryableExtensions;
using POES.Entities;

namespace POES.Services;

public class ParameterService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public ParameterService(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }
    public async Task<List<ParameterReadDto>> GetAllAsync()
   {
    return await _db.Parameters
        .OrderByDescending(p => p.SeqNo)
        .ProjectTo<ParameterReadDto>(_mapper.ConfigurationProvider)
        .ToListAsync();
   }
   public async Task<ParameterReadDto?> GetLatestAsync()
  {
    return await _db.Parameters
        .OrderByDescending(p => p.SeqNo)
        .ProjectTo<ParameterReadDto>(_mapper.ConfigurationProvider)
        .FirstOrDefaultAsync();
  }
  public async Task<ParameterReadDto?> GetBySeqNoAsync(long seqNo)
  {
    var parameter = await _db.Parameters
        .Where(p => p.SeqNo == seqNo)
        .ProjectTo<ParameterReadDto>(_mapper.ConfigurationProvider)
        .FirstOrDefaultAsync();

    return parameter;
}
public async Task<ParameterReadDto> CreateAsync(ParameterCreateDto dto)
{
    var entity = _mapper.Map<Parameter>(dto);

    entity.CreationDate = DateTime.UtcNow;
    entity.ModifiedByLogin = string.Empty;
    entity.ModificationDate = null;

    _db.Parameters.Add(entity);

    await _db.SaveChangesAsync();

    return _mapper.Map<ParameterReadDto>(entity);
}
public async Task<bool> UpdateAsync(long seqNo, ParameterUpdateDto dto)
{
    // Find the latest parameter record
    var latestSeqNo = await _db.Parameters
        .MaxAsync(p => (long?)p.SeqNo);

    // Allow updates only on the latest record
    if (latestSeqNo is null || latestSeqNo != seqNo)
    {
        throw new InvalidOperationException(
            "Only the latest Parameter record can be updated.");
    }

    var entity = await _db.Parameters.FindAsync(seqNo);

    if (entity is null)
        return false;

    _mapper.Map(dto, entity);

    entity.ModifiedByLogin = "System";   // Replace with logged-in user later
    entity.ModificationDate = DateTime.UtcNow;

    await _db.SaveChangesAsync();

    return true;
}
}