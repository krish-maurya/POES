using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POES.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FirstFreeNumbers",
                columns: new[] { "NumberGroup", "Description", "FirstFreeNo" },
                values: new object[] { "ITM", "Item", 1L });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FirstFreeNumbers",
                keyColumn: "NumberGroup",
                keyValue: "ITM");
        }
    }
}
