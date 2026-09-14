import { MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateUserTable1789392967266 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "Users",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "nameUsers",
                    type: "varchar"
                },
                {
                    name: "email",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "situationId",
                    type: "int",
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
        }));
        await queryRunner.createForeignKey(
            "Users",
            new TableForeignKey({
            columnNames: ["situationId"],
            referencedColumnNames: ["id"],
            referencedTableName: "Situations",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("Users");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.includes("situationId"));
        if (foreignKey) {
            await queryRunner.dropForeignKey("Users", foreignKey);
        }
        await queryRunner.dropTable("Users");
    }   
}
