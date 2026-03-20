import { Schedule } from './schedule.entity';

export const SCHEDULE_REPOSITORY = Symbol('SCHEDULE_REPOSITORY');

export type ScheduleSortField = 'slot' | 'createdAt' | 'courseName';

export type FindPaginatedOptions = {
  offset: number;
  limit: number;
  sortBy?: ScheduleSortField;
  sortOrder?: 'asc' | 'desc';
};

export interface IScheduleRepository {
  findAll(): Promise<Schedule[]>;
  findById(id: string): Promise<Schedule | null>;
  save(schedule: Schedule): Promise<Schedule>;
  count(): Promise<number>;
  findPaginated(options: FindPaginatedOptions): Promise<{ data: Schedule[]; total: number }>;
  delete(id: string): Promise<void>;
}
