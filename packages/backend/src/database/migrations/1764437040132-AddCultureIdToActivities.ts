import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCultureIdToActivities1764437040132 implements MigrationInterface {
    name = 'AddCultureIdToActivities1764437040132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add cultureId column to activities table
        await queryRunner.query(`ALTER TABLE "activities" ADD "cultureId" uuid`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_df32e8020b668f62f4ec62d6037" FOREIGN KEY ("cultureId") REFERENCES "cultures"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove cultureId column from activities table
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_df32e8020b668f62f4ec62d6037"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "cultureId"`);
    }

}
