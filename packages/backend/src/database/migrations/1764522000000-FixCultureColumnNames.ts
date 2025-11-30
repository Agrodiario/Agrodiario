// src/database/migrations/FixCultureColumnNames.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCultureColumnNames1764522000000 implements MigrationInterface {
    name = 'FixCultureColumnNames1764522000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renomear culture-name para cultureName
        await queryRunner.query(`
            ALTER TABLE "cultures" 
            RENAME COLUMN "culture-name" TO "cultureName"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter
        await queryRunner.query(`
            ALTER TABLE "cultures" 
            RENAME COLUMN "cultureName" TO "culture-name"
        `);
    }
}