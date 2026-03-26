import { Classroom } from './classroom.entity';

export const CLASSROOM_REPOSITORY = Symbol('CLASSROOM_REPOSITORY');

export interface IClassroomRepository {
  findAll(): Promise<Classroom[]>;
  findById(id: string): Promise<Classroom | null>;
  save(classroom: Classroom): Promise<Classroom>;
  delete(id: string): Promise<void>;
}
