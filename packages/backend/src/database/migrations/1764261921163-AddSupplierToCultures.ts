import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSupplierToCultures1764261921163 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'supplier',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('cultures', 'supplier');
  }
}
