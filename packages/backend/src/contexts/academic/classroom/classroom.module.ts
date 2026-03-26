import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomService } from './application/classroom.service';
import { CLASSROOM_REPOSITORY } from './domain/classroom.repository';
import { ClassroomTypeOrmEntity } from './infrastructure/classroom-typeorm.entity';
import { ClassroomTypeOrmRepository } from './infrastructure/classroom-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassroomTypeOrmEntity])],
  providers: [
    ClassroomService,
    {
      provide: CLASSROOM_REPOSITORY,
      useClass: ClassroomTypeOrmRepository,
    },
  ],
  exports: [ClassroomService],
})
export class ClassroomModule {}
