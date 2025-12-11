// src/database/migrations/FixCultureColumnNames.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCultureColumnNames1764522000000 implements MigrationInterface {
    name = 'FixCultureColumnNames1764522000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar se a coluna culture-name existe antes de renomear
        const result = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'cultures' AND column_name = 'culture-name'
        `);
        
        if (result.length > 0) {
            await queryRunner.query(`
                ALTER TABLE "cultures" 
                RENAME COLUMN "culture-name" TO "cultureName"
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter
        await queryRunner.query(`
            ALTER TABLE "cultures" 
            RENAME COLUMN "cultureName" TO "culture-name"
        `);
    }
}