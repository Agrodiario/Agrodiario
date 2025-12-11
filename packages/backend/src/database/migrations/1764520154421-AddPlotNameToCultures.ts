import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlotNameToCultures1764520154421 implements MigrationInterface {
  name = 'AddPlotNameToCultures1764520154421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cultures" ADD "plotName" character varying(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cultures" DROP COLUMN "plotName"`);
  }
}
