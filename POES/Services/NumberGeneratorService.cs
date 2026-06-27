using Microsoft.EntityFrameworkCore;
using POES.Data;
namespace POES.Services;

public class NumberGeneratorService(AppDbContext db)
{
    private readonly AppDbContext _db = db;

    public async Task<string> GenerateAsync(string group ) {
        
        var ffn = await _db.FirstFreeNumbers
            .FromSqlRaw("SELECT * FROM FirstFreeNumbers WITH (UPDLOCK) WHERE NumberGroup = {0}", group)
            .FirstOrDefaultAsync();

        if (ffn is null) throw new Exception($"Number group '{group}' not configured.");

        string number = group + ffn.FirstFreeNo.ToString().PadLeft(6, '0');

        ffn.FirstFreeNo++;

        await _db.SaveChangesAsync();
        
        return number;
    }
}