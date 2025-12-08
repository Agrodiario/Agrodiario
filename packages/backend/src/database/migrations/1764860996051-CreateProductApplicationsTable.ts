import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductApplicationsTable1764860996051 implements MigrationInterface {
  name = 'CreateProductApplicationsTable1764860996051';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE "product_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "propertyId" uuid NOT NULL, "cultureId" uuid NOT NULL, "area" character varying(255) NOT NULL, "productId" uuid NOT NULL, "productName" character varying(255) NOT NULL, "applicationDate" date NOT NULL, CONSTRAINT "PK_6536083f0dbdf261a422c475e95" PRIMARY KEY ("id"))`);
      await queryRunner.query(`ALTER TABLE "product_applications" ADD CONSTRAINT "FK_c324b6a880262b52b283a5307f1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "product_applications" ADD CONSTRAINT "FK_a8f302aeb3152cbc068c83b9807" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "product_applications" ADD CONSTRAINT "FK_c39e09e261090884aac8c8421b1" FOREIGN KEY ("cultureId") REFERENCES "cultures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
      await queryRunner.query(`ALTER TABLE "product_applications" ADD CONSTRAINT "FK_ba6d9ddd7d8703e6b8c196e44f2" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "product_applications" DROP CONSTRAINT "FK_ba6d9ddd7d8703e6b8c196e44f2"`);
      await queryRunner.query(`ALTER TABLE "product_applications" DROP CONSTRAINT "FK_c39e09e261090884aac8c8421b1"`);
      await queryRunner.query(`ALTER TABLE "product_applications" DROP CONSTRAINT "FK_a8f302aeb3152cbc068c83b9807"`);
      await queryRunner.query(`ALTER TABLE "product_applications" DROP CONSTRAINT "FK_c324b6a880262b52b283a5307f1"`);
      await queryRunner.query(`DROP TABLE "product_applications"`);
    }

}
