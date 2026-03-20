import { Injectable, Inject } from '@nestjs/common';
import { Schedule } from '../domain/schedule.entity';
import { IScheduleRepository, SCHEDULE_REPOSITORY, ScheduleSortField } from '../domain/schedule.repository';
import { CourseService } from '../../course/application/course.service';

export type SchedulesPaginatedResult = {
  data: Array<Schedule & { courseName: string;}>;
  total: number;
};

const DAY_ORDER: Record<string, number> = {
  'Lunes': 0,
  'Martes': 1,
  'Miércoles': 2,
  'Jueves': 3,
  'Viernes': 4,
  'Sábado': 5,
  'Domingo': 6,
};

@Injectable()
export class ScheduleService {
  constructor(
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IScheduleRepository,
    private readonly courseService: CourseService,
  ) {}

  private sortSchedules(
    data: Array<Schedule & { courseName: string }>,
    sortBy?: ScheduleSortField,
    sortOrder?: 'asc' | 'desc',
  ): Array<Schedule & { courseName: string }> {
    if (!sortBy) return data;

    const sorted = [...data];
    const isAsc = sortOrder === 'asc';

    sorted.sort((a, b) => {
      let compareResult = 0;

      if (sortBy === 'courseName') {
        compareResult = a.courseName.localeCompare(b.courseName);
      } else if (sortBy === 'slot') {

        const [dayA, timeA] = a.slot.split(' ');
        const [dayB, timeB] = b.slot.split(' ');
        
        console.log('DEBUG sortSchedules:', { dayA, timeA, dayB, timeB, 'DAY_ORDER[dayA]': DAY_ORDER[dayA], 'DAY_ORDER[dayB]': DAY_ORDER[dayB] });
        
        const dayOrderA = DAY_ORDER[dayA] ?? 7;
        const dayOrderB = DAY_ORDER[dayB] ?? 7;

        if (dayOrderA !== dayOrderB) {
          compareResult = dayOrderA - dayOrderB;
        } else {
          compareResult = (timeA || '').localeCompare(timeB || '');
        }
      }

      return isAsc ? compareResult : -compareResult;
    });

    return sorted;
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.findAll();
  }

  async findAllWithCourseInfo(): Promise<
      Array<Schedule & { courseName: string }>
    > {
      const schedules = await this.scheduleRepository.findAll();
      const result: Array<Schedule & { courseName: string }> = [];
      for (const schedule of schedules) {
        const course = await this.courseService.findById(schedule.courseId);
        result.push({
          ...schedule,
          courseName: course?.name ?? '',
        });
      }
      return result;
    }
  
    async findPaginatedWithUserInfo(
      page: number,
      pageSize: number,
      sortBy?: ScheduleSortField,
      sortOrder?: 'asc' | 'desc',
    ): Promise<SchedulesPaginatedResult> {
      const offset = (Math.max(1, page) - 1) * Math.max(1, pageSize);
      const limit = Math.min(100, Math.max(1, pageSize));
      
      const shouldSortInMemory = sortBy === 'courseName' || sortBy === 'slot';
      
      let schedules: Schedule[];
      let total: number;

      if (shouldSortInMemory) {
      
        schedules = await this.scheduleRepository.findAll();
        total = schedules.length;
      } else {
      
        const result = await this.scheduleRepository.findPaginated({
          offset,
          limit,
          sortBy,
          sortOrder,
        });
        schedules = result.data;
        total = result.total;
      }
      
      const data: Array<Schedule & { courseName: string }> = [];
      for (const schedule of schedules) {
        const course = await this.courseService.findById(schedule.courseId);
        data.push({
          ...schedule,
          courseName: course?.name ?? '',
        });
      }

      const sorted = shouldSortInMemory 
        ? this.sortSchedules(data, sortBy, sortOrder)
        : data;

      const paginatedData = sorted.slice(offset, offset + limit);
      
      return { data: paginatedData, total };
    }

  async findById(id: string): Promise<Schedule | null> {
    return this.scheduleRepository.findById(id);
  }

  async create(data: { courseId: string; slot: string }): Promise<Schedule> {
    const id = crypto.randomUUID();
    const schedule = new Schedule(id, data.courseId, data.slot);
    return this.scheduleRepository.save(schedule);
  }

  async update(id: string, data:{ slot?: string, courseId?: string}): Promise<Schedule | null>{
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) return null;

    const slot = data.slot?.trim() ?? schedule.slot;
    const courseId = data.courseId?.trim() ?? schedule.courseId;

    const updated = new Schedule(
      schedule.id,
      courseId,
      slot
    );
    
    await this.scheduleRepository.save(updated);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) return false;
    await this.scheduleRepository.delete(id);
    return true;
  }
}
