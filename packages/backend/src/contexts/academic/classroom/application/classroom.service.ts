import { Injectable, Inject } from '@nestjs/common';
import { Classroom } from '../domain/classroom.entity';
import {
  CLASSROOM_REPOSITORY,
  IClassroomRepository,
} from '../domain/classroom.repository';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject(CLASSROOM_REPOSITORY)
    private readonly classroomRepository: IClassroomRepository,
  ) {}

  async findAll(): Promise<Classroom[]> {
    return this.classroomRepository.findAll();
  }

  async findById(id: string): Promise<Classroom | null> {
    return this.classroomRepository.findById(id);
  }

  async create(data: {
    code: string;
    building: string;
    capacity: number;
  }): Promise<Classroom> {
    const classroom = new Classroom(
      crypto.randomUUID(),
      data.code,
      data.building,
      data.capacity,
    );
    return this.classroomRepository.save(classroom);
  }

  async update(
    id: string,
    data: {
      code?: string;
      building?: string;
      capacity?: number;
    },
  ): Promise<Classroom | null> {
    const classroom = await this.classroomRepository.findById(id);
    if (!classroom) return null;

    classroom.code = data.code ?? classroom.code;
    classroom.building = data.building ?? classroom.building;
    classroom.capacity = data.capacity ?? classroom.capacity;

    return this.classroomRepository.save(classroom);
  }

  async delete(id: string): Promise<boolean> {
    const classroom = await this.classroomRepository.findById(id);
    if (!classroom) return false;
    await this.classroomRepository.delete(id);
    return true;
  }
}
