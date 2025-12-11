import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPlantingAreaAndObservationsToCultures1764262763997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'planting_area',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'observations',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('cultures', 'observations');
    await queryRunner.dropColumn('cultures', 'planting_area');
  }
}
