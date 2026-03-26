import { Injectable, Inject } from '@nestjs/common';
import { Course } from '../domain/course';
import { ICourseRepository, COURSE_REPOSITORY } from '../domain/course.repository';

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }

  async findById(id: string): Promise<Course | null> {
    return this.courseRepository.findById(id);
  }

  async create(data: any) {
    const courseData = { id: crypto.randomUUID(), ...data };
    return await this.courseRepository.save(courseData);
  }

  async update(id: string, data: any) {
  const course = await this.findById(id);
  if (!course) return null;

  Object.assign(course, data);
  return await this.courseRepository.save(course);
}

async remove(id: string) {
  const course = await this.findById(id);
  if (!course) return null;

  await this.courseRepository.delete(id);
  return course;
}
}
