import { MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AddSlugToProducts1790240000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.addColumn("Products", new TableColumn({
                name: "slug",
                type: "varchar",
                isUnique: true,
                isNullable: false
            }));
        await queryRunner.query(
            "ALTER TABLE Products MODIFY COLUMN slug VARCHAR(255) AFTER name"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropColumn("Products","slug" );
    }
}