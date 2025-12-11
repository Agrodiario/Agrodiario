import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOriginToCultures1764193338002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
            CREATE TYPE culture_origin_enum AS ENUM ('organic', 'conventional', 'transgenic')
        `);

    // Add column with enum type
    await queryRunner.addColumn(
      'cultures',
      new TableColumn({
        name: 'origin',
        type: 'culture_origin_enum',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop column
    await queryRunner.dropColumn('cultures', 'origin');

    // Drop enum type
    await queryRunner.query(`
            DROP TYPE culture_origin_enum
        `);
  }
}
