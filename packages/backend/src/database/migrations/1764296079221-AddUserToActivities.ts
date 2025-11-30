import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserToActivities1764296079221 implements MigrationInterface {
    name = 'AddUserToActivities1764296079221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "userId"`);
    }

}
