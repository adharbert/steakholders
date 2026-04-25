using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SteakholdersMeatup.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReviewAndOrderSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ValueRating",
                table: "Reviews",
                newName: "TasteRating");

            migrationBuilder.RenameColumn(
                name: "TendernessRating",
                table: "Reviews",
                newName: "ServiceRating");

            migrationBuilder.RenameColumn(
                name: "FlavorRating",
                table: "Reviews",
                newName: "FoodQualityRating");

            migrationBuilder.RenameColumn(
                name: "DonenessRating",
                table: "Reviews",
                newName: "AmbianceRating");

            migrationBuilder.AddColumn<string>(
                name: "Temperature",
                table: "Orders",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Temperature",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "TasteRating",
                table: "Reviews",
                newName: "ValueRating");

            migrationBuilder.RenameColumn(
                name: "ServiceRating",
                table: "Reviews",
                newName: "TendernessRating");

            migrationBuilder.RenameColumn(
                name: "FoodQualityRating",
                table: "Reviews",
                newName: "FlavorRating");

            migrationBuilder.RenameColumn(
                name: "AmbianceRating",
                table: "Reviews",
                newName: "DonenessRating");
        }
    }
}
