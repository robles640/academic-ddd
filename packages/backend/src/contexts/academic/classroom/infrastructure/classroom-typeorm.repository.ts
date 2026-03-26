import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from '../domain/classroom.entity';
import { IClassroomRepository } from '../domain/classroom.repository';
import { ClassroomTypeOrmEntity } from './classroom-typeorm.entity';

@Injectable()
export class ClassroomTypeOrmRepository implements IClassroomRepository {
  constructor(
    @InjectRepository(ClassroomTypeOrmEntity)
    private readonly repo: Repository<ClassroomTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Classroom[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Classroom | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(classroom: Classroom): Promise<Classroom> {
    const row = this.repo.create({
      id: classroom.id,
      code: classroom.code,
      building: classroom.building,
      capacity: classroom.capacity,
    });
    await this.repo.save(row);
    return classroom;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: ClassroomTypeOrmEntity): Classroom {
    return new Classroom(row.id, row.code, row.building, row.capacity);
  }
}
