import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  credits: number;
}