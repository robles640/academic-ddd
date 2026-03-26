import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository, type FindPaginatedOptions, type ScheduleSortField } from '../domain/schedule.repository';
import { ScheduleTypeOrmEntity } from './schedule-typeorm.entity';

const SORT_FIELD_MAP: Partial<Record<ScheduleSortField, keyof ScheduleTypeOrmEntity>> = {
  slot: 'slot',
  createdAt: 'createdAt',
};

@Injectable()
export class ScheduleTypeOrmRepository implements IScheduleRepository {
  constructor(
    @InjectRepository(ScheduleTypeOrmEntity)
    private readonly repo: Repository<ScheduleTypeOrmEntity>,
  ) {}

  async findAll(): Promise<Schedule[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Schedule | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async save(schedule: Schedule): Promise<Schedule> {
    const row = this.repo.create({
      id: schedule.id,
      courseId: schedule.courseId,
      slot: schedule.slot,
      classroomId: schedule.classroomId,
    });
    await this.repo.save(row);
    return schedule;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: ScheduleTypeOrmEntity): Schedule {
    return new Schedule(row.id, row.courseId, row.slot, row.classroomId);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async findPaginated(options: FindPaginatedOptions): Promise<{ data: Schedule[]; total: number }> {
      const { offset, limit, sortBy = 'createdAt', sortOrder = 'asc' } = options;
      const orderField = SORT_FIELD_MAP[sortBy] ?? 'createdAt';
      const [rows, total] = await this.repo.findAndCount({
        order: { [orderField]: sortOrder.toUpperCase() as 'ASC' | 'DESC' },
        skip: offset,
        take: limit,
      });
      return { data: rows.map((r) => this.toDomain(r)), total };
    }

}
