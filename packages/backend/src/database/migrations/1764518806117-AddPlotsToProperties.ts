import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlotsToProperties1764518806117 implements MigrationInterface {
    name = 'AddPlotsToProperties1764518806117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_df32e8020b668f62f4ec62d6037"`);
        await queryRunner.query(`ALTER TABLE "properties" ADD "plots" jsonb`);
        await queryRunner.query(`ALTER TYPE "public"."culture_origin_enum" RENAME TO "culture_origin_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."cultures_origin_enum" AS ENUM('organic', 'conventional', 'transgenic')`);
        await queryRunner.query(`ALTER TABLE "cultures" ALTER COLUMN "origin" TYPE "public"."cultures_origin_enum" USING "origin"::"text"::"public"."cultures_origin_enum"`);
        await queryRunner.query(`DROP TYPE "public"."culture_origin_enum_old"`);
        await queryRunner.query(`ALTER TABLE "cultures" ADD CONSTRAINT "FK_67ae92769bf8a15de3c53384bcd" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cultures" ADD CONSTRAINT "FK_3cb657c29b302fc5419c42889ec" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_effcedfa48ba60812fa29d432b6" FOREIGN KEY ("cultureId") REFERENCES "cultures"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_effcedfa48ba60812fa29d432b6"`);
        await queryRunner.query(`ALTER TABLE "cultures" DROP CONSTRAINT "FK_3cb657c29b302fc5419c42889ec"`);
        await queryRunner.query(`ALTER TABLE "cultures" DROP CONSTRAINT "FK_67ae92769bf8a15de3c53384bcd"`);
        await queryRunner.query(`CREATE TYPE "public"."culture_origin_enum_old" AS ENUM('organic', 'conventional', 'transgenic')`);
        await queryRunner.query(`ALTER TABLE "cultures" ALTER COLUMN "origin" TYPE "public"."culture_origin_enum_old" USING "origin"::"text"::"public"."culture_origin_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."cultures_origin_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."culture_origin_enum_old" RENAME TO "culture_origin_enum"`);
        await queryRunner.query(`ALTER TABLE "properties" DROP COLUMN "plots"`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_df32e8020b668f62f4ec62d6037" FOREIGN KEY ("cultureId") REFERENCES "cultures"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cultures" ADD CONSTRAINT "FK_cultures_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cultures" ADD CONSTRAINT "FK_cultures_property" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}