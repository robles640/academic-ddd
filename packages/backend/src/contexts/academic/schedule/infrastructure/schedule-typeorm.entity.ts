import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('schedules')
export class ScheduleTypeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'course_id' })
  courseId: string;

  @Column()
  slot: string;

  @Column('uuid', { name: 'classroom_id', nullable: true })
  classroomId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
