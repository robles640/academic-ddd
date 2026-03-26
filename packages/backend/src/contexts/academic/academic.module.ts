import { Module } from '@nestjs/common';
import { StudentModule } from './student/student.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CourseModule } from './course/course.module';
import { DepartmentModule } from './department/department.module';
import { ClassroomModule } from './classroom/classroom.module';

@Module({
  imports: [StudentModule, ScheduleModule, CourseModule, ClassroomModule, DepartmentModule],
  exports: [StudentModule, ScheduleModule, CourseModule, ClassroomModule, DepartmentModule],
})
export class AcademicModule {}