import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './application/schedule.service';
import {
  STUDENT_SCHEDULE_REPOSITORY,
} from './domain/student-schedule.repository';
import { SCHEDULE_REPOSITORY } from './domain/schedule.repository';
import { ScheduleTypeOrmEntity } from './infrastructure/schedule-typeorm.entity';
import { ScheduleTypeOrmRepository } from './infrastructure/schedule-typeorm.repository';
import { StudentScheduleTypeOrmEntity } from './infrastructure/student-schedule-typeorm.entity';
import { StudentScheduleTypeOrmRepository } from './infrastructure/student-schedule-typeorm.repository';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleTypeOrmEntity,
      StudentScheduleTypeOrmEntity,
    ]),
    CourseModule,
  ],
  providers: [
    ScheduleService,
    {
      provide: SCHEDULE_REPOSITORY,
      useClass: ScheduleTypeOrmRepository,
    },
    {
      provide: STUDENT_SCHEDULE_REPOSITORY,
      useClass: StudentScheduleTypeOrmRepository,
    },
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
