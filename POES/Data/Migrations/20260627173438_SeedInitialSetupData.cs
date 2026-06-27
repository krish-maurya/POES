using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace POES.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialSetupData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FirstFreeNumbers",
                columns: new[] { "NumberGroup", "Description", "FirstFreeNo" },
                values: new object[,]
                {
                    { "PO", "PurOrd", 1L },
                    { "SUP", "Vendor", 1L }
                });

            migrationBuilder.InsertData(
                table: "Parameters",
                columns: new[] { "SeqNo", "CreatedByLogin", "CreationDate", "ModificationDate", "ModifiedByLogin", "NumberGroupPurchaseOrder", "NumberGroupSupplier" },
                values: new object[] { 1L, "System", new DateTime(2026, 6, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "", "PO", "SUP" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FirstFreeNumbers",
                keyColumn: "NumberGroup",
                keyValue: "PO");

            migrationBuilder.DeleteData(
                table: "FirstFreeNumbers",
                keyColumn: "NumberGroup",
                keyValue: "SUP");

            migrationBuilder.DeleteData(
                table: "Parameters",
                keyColumn: "SeqNo",
                keyValue: 1L);
        }
    }
}
