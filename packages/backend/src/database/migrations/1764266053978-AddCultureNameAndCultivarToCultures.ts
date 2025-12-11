import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCultureNameAndCultivarToCultures1764266053978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'culture-name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'cultivar',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('cultures', 'cultivar');
    await queryRunner.dropColumn('cultures', 'culture-name');
  }
}
