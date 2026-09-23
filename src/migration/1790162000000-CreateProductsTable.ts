import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductsTable1790162000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(
            new Table({
                name: "Products",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "name",
                        type: "varchar"
                    },
                    {
                        name: "productCategoryId",
                        type: "int"
                    },
                    {
                        name: "productSituationId",
                        type: "int"
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP"
                    }
                ]
            })
        );

        await queryRunner.createForeignKey(
            "Products",
            new TableForeignKey({
                columnNames: ["productCategoryId"],
                referencedColumnNames: ["id"],
                referencedTableName: "ProductCategories",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "Products",
            new TableForeignKey({
                columnNames: ["productSituationId"],
                referencedColumnNames: ["id"],
                referencedTableName: "ProductSituations",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        const table = await queryRunner.getTable("Products");

        const fkCategory = table?.foreignKeys.find(
            fk => fk.columnNames.includes("productCategoryId")
        );

        const fkSituation = table?.foreignKeys.find(
            fk => fk.columnNames.includes("productSituationId")
        );

        if (fkCategory) {
            await queryRunner.dropForeignKey("Products", fkCategory);
        }

        if (fkSituation) {
            await queryRunner.dropForeignKey("Products", fkSituation);
        }

        await queryRunner.dropTable("Products");
    }
}