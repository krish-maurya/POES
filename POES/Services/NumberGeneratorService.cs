using Microsoft.EntityFrameworkCore;
using POES.Data;
namespace POES.Services;

public class NumberGeneratorService
{
    public async Task<string> GenerateAsync(string group , AppDbContext dbContext) {
        
        var ffn = await dbContext.FirstFreeNumbers
            .FromSqlRaw("SELECT * FROM FirstFreeNumbers WITH (UPDLOCK) WHERE NumberGroup = {0}", group)
            .FirstOrDefaultAsync();

        if (ffn is null) throw new Exception($"Number group '{group}' not configured.");

        string number = group + ffn.FirstFreeNo.ToString().PadLeft(6, '0');

        ffn.FirstFreeNo++;

        await dbContext.SaveChangesAsync();
        
        return number;
    }
}