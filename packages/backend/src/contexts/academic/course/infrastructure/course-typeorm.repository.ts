import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CourseEntity } from './persistence/course.entity';
import { Course } from '../domain/course';

@Injectable()
export class CourseTypeOrmRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly repository: Repository<CourseEntity>,
  ) {}

  async findAll(): Promise<Course[]> {
    const rows = await this.repository.find();
    return rows.map(
      (row) => new Course(row.id, row.name, row.code, row.credits),
    );
  }

  async findById(id: string): Promise<Course | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? new Course(row.id, row.name, row.code, row.credits) : null;
  }

  async save(data: any): Promise<Course> {
    const entity = this.repository.create({
      id: data.id,
      name: data.name,
      code: data.code,
      credits: data.credits,
    });
    const saved = await this.repository.save(entity) as unknown as CourseEntity;

    return new Course(saved.id, saved.name, saved.code, saved.credits);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}