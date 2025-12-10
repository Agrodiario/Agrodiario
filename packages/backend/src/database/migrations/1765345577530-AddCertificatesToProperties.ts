import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCertificatesToProperties1765345577530 implements MigrationInterface {
    name = 'AddCertificatesToProperties1765345577530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" RENAME COLUMN "certifications" TO "certificates"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "properties" RENAME COLUMN "certificates" TO "certifications"`);
    }

}
