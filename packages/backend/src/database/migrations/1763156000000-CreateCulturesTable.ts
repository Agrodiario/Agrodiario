import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCulturesTable1763156000000 implements MigrationInterface {
  name = 'CreateCulturesTable1763156000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cultures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "propertyId" uuid NOT NULL, "userId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "property_id" uuid, "user_id" uuid, CONSTRAINT "PK_a2a7e3df7c20c72eba8b06aaa11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultures" ADD CONSTRAINT "FK_cultures_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cultures" ADD CONSTRAINT "FK_cultures_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cultures" DROP CONSTRAINT "FK_cultures_user"`);
    await queryRunner.query(`ALTER TABLE "cultures" DROP CONSTRAINT "FK_cultures_property"`);
    await queryRunner.query(`DROP TABLE "cultures"`);
  }
}
