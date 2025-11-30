import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTitleAndOperationActivities1764215550027 implements MigrationInterface {
    name = 'AddTitleAndOperationActivities1764215550027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" ADD "titulo" character varying`);
        await queryRunner.query(`ALTER TABLE "activities" ADD "operacao" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "operacao"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "titulo"`);
    }

}
