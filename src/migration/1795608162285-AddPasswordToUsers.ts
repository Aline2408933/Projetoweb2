import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPasswordToUsers1795608162285 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
    'Users',
    new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: false
    }));
    await queryRunner.query(
        'ALTER TABLE Users MODIFY COLUMN password VARCHAR(255) AFTER email');
 }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            'Users',
            'password'
        );


    }


}
