import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1763155979608 implements MigrationInterface {
  name = 'InitialSchema1763155979608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "properties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "address" character varying(500) NOT NULL, "totalArea" numeric(10,2) NOT NULL, "productionArea" numeric(10,2) NOT NULL, "mainCrop" character varying(100) NOT NULL, "certifications" text, "isActive" boolean NOT NULL DEFAULT true, "userId" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "cpf" character varying(14) NOT NULL, "phone" character varying(20) NOT NULL, "birthDate" date NOT NULL, "emailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying(255), "passwordResetToken" character varying(255), "passwordResetExpires" TIMESTAMP, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "lastFailedLogin" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "properties" ADD CONSTRAINT "FK_cea2dfaff2198bf6a43447f7056" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "properties" DROP CONSTRAINT "FK_cea2dfaff2198bf6a43447f7056"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "properties"`);
  }
}
