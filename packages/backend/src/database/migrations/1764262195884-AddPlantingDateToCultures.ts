import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPlantingDateToCultures1764262195884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'planting_date',
        type: 'date',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('cultures', 'planting_date');
  }
}
