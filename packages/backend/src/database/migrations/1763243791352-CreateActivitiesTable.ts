import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateActivitiesTable1763243791352 implements MigrationInterface {
    name = 'CreateActivitiesTable1763243791352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."activities_tipo_enum" AS ENUM('preparo', 'aplicacao', 'colheita', 'manejo')`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" SERIAL NOT NULL, "date" date NOT NULL, "propriedade" character varying NOT NULL, "tipo" "public"."activities_tipo_enum" NOT NULL DEFAULT 'preparo', "descricao" text, "responsavel" character varying NOT NULL, "insumoNome" character varying, "insumoQuantidade" numeric(10,2), "insumoUnidade" character varying, "anexos" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "public"."activities_tipo_enum"`);
    }

}
