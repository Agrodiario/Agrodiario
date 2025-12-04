import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1764860423318 implements MigrationInterface {
  name = 'CreateProductsTable1764860423318'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "registrationNumber" character varying(50) NOT NULL, "commercialNames" character varying array NOT NULL, "registrationHolder" character varying(255) NOT NULL, "categories" character varying array NOT NULL, "activeIngredients" character varying array NOT NULL, "organicFarmingProduct" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
