import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCulturesColumns1764438217572 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Migrate data from snake_case to camelCase columns (if any data exists)
        await queryRunner.query(`
            UPDATE cultures 
            SET "propertyId" = property_id 
            WHERE property_id IS NOT NULL AND "propertyId" IS NULL
        `);
        
        await queryRunner.query(`
            UPDATE cultures 
            SET "userId" = user_id 
            WHERE user_id IS NOT NULL AND "userId" IS NULL
        `);

        // Drop old snake_case columns
        await queryRunner.query(`ALTER TABLE "cultures" DROP COLUMN IF EXISTS "property_id"`);
        await queryRunner.query(`ALTER TABLE "cultures" DROP COLUMN IF EXISTS "user_id"`);
        
        // Rename snake_case columns to camelCase
        await queryRunner.query(`ALTER TABLE "cultures" RENAME COLUMN "planting_date" TO "plantingDate"`);
        await queryRunner.query(`ALTER TABLE "cultures" RENAME COLUMN "planting_area" TO "plantingArea"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert camelCase to snake_case
        await queryRunner.query(`ALTER TABLE "cultures" RENAME COLUMN "plantingDate" TO "planting_date"`);
        await queryRunner.query(`ALTER TABLE "cultures" RENAME COLUMN "plantingArea" TO "planting_area"`);
        
        // Recreate old columns
        await queryRunner.query(`ALTER TABLE "cultures" ADD "property_id" uuid`);
        await queryRunner.query(`ALTER TABLE "cultures" ADD "user_id" uuid`);
    }

}
