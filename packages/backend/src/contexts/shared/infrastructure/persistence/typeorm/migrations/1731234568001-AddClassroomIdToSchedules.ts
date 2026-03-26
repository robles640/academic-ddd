import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassroomIdToSchedules1731234568001
  implements MigrationInterface
{
  name = 'AddClassroomIdToSchedules1731234568001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedules"
      ADD COLUMN IF NOT EXISTS "classroom_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "schedules"
      ADD CONSTRAINT "FK_schedules_classroom_id"
      FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id")
      ON DELETE SET NULL
    `).catch(() => undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedules"
      DROP CONSTRAINT IF EXISTS "FK_schedules_classroom_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "schedules" DROP COLUMN IF EXISTS "classroom_id"
    `);
  }
}
