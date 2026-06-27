using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace POES.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FirstFreeNumbers",
                columns: table => new
                {
                    NumberGroup = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstFreeNo = table.Column<long>(type: "bigint", nullable: false, defaultValue: 1L)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FirstFreeNumbers", x => x.NumberGroup);
                });

            migrationBuilder.CreateTable(
                name: "Parameters",
                columns: table => new
                {
                    SeqNo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumberGroupSupplier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NumberGroupPurchaseOrder = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedByLogin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedByLogin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModificationDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parameters", x => x.SeqNo);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    SupplierCode = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ZipCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Town = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Fax = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.SupplierCode);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    ItemCode = table.Column<string>(type: "nvarchar(37)", maxLength: 37, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Variety = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Packing = table.Column<int>(type: "int", nullable: false),
                    GrossWeight = table.Column<double>(type: "float", nullable: false),
                    NetWeight = table.Column<double>(type: "float", nullable: false),
                    SupplierCode = table.Column<string>(type: "nvarchar(9)", nullable: false),
                    Price = table.Column<double>(type: "float", nullable: false),
                    ItemText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InventoryOnHand = table.Column<double>(type: "float", nullable: false),
                    InventoryOnOrder = table.Column<double>(type: "float", nullable: false),
                    InventoryAllocated = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.ItemCode);
                    table.ForeignKey(
                        name: "FK_Items_Suppliers_SupplierCode",
                        column: x => x.SupplierCode,
                        principalTable: "Suppliers",
                        principalColumn: "SupplierCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "POHeaders",
                columns: table => new
                {
                    OrderNumber = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false),
                    SupplierCode = table.Column<string>(type: "nvarchar(9)", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ArrivalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OrderStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POHeaders", x => x.OrderNumber);
                    table.ForeignKey(
                        name: "FK_POHeaders_Suppliers_SupplierCode",
                        column: x => x.SupplierCode,
                        principalTable: "Suppliers",
                        principalColumn: "SupplierCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "POLines",
                columns: table => new
                {
                    OrderNumber = table.Column<string>(type: "nvarchar(9)", maxLength: 9, nullable: false),
                    Position = table.Column<byte>(type: "tinyint", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(37)", nullable: false),
                    Price = table.Column<double>(type: "float", nullable: false),
                    OrderedQuantity = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_POLines", x => new { x.OrderNumber, x.Position });
                    table.ForeignKey(
                        name: "FK_POLines_Items_ItemCode",
                        column: x => x.ItemCode,
                        principalTable: "Items",
                        principalColumn: "ItemCode");
                    table.ForeignKey(
                        name: "FK_POLines_POHeaders_OrderNumber",
                        column: x => x.OrderNumber,
                        principalTable: "POHeaders",
                        principalColumn: "OrderNumber");
                });

            migrationBuilder.CreateTable(
                name: "Arrivals",
                columns: table => new
                {
                    OrderNumber = table.Column<string>(type: "nvarchar(9)", nullable: false),
                    Position = table.Column<byte>(type: "tinyint", nullable: false),
                    ArrivedQuantity = table.Column<double>(type: "float", nullable: false),
                    ArrivalDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Arrivals", x => new { x.OrderNumber, x.Position });
                    table.ForeignKey(
                        name: "FK_Arrivals_POLines_OrderNumber_Position",
                        columns: x => new { x.OrderNumber, x.Position },
                        principalTable: "POLines",
                        principalColumns: new[] { "OrderNumber", "Position" });
                });

            migrationBuilder.CreateIndex(
                name: "IX_Items_SupplierCode_ItemCode",
                table: "Items",
                columns: new[] { "SupplierCode", "ItemCode" });

            migrationBuilder.CreateIndex(
                name: "IX_POHeaders_SupplierCode",
                table: "POHeaders",
                column: "SupplierCode");

            migrationBuilder.CreateIndex(
                name: "IX_POLines_ItemCode",
                table: "POLines",
                column: "ItemCode");

            migrationBuilder.CreateIndex(
                name: "IX_POLines_OrderNumber_ItemCode",
                table: "POLines",
                columns: new[] { "OrderNumber", "ItemCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Arrivals");

            migrationBuilder.DropTable(
                name: "FirstFreeNumbers");

            migrationBuilder.DropTable(
                name: "Parameters");

            migrationBuilder.DropTable(
                name: "POLines");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "POHeaders");

            migrationBuilder.DropTable(
                name: "Suppliers");
        }
    }
}
