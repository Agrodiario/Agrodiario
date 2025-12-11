import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCycleToCultures1764192856105 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'cycle',
        type: 'integer',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('cultures', 'cycle');
  }
}
