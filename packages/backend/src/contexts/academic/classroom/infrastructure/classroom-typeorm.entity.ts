import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('classrooms')
export class ClassroomTypeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  building: string;

  @Column('int')
  capacity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
