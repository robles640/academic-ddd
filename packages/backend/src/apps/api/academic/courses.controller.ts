export class CreateCourseDto {
  name: string;
  code: string;
  credits: number;
}


import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';
import { CourseService } from '../../../contexts/academic/course/application/course.service';
import { UpdateCourseDto } from 'src/contexts/academic/course/application/dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courseService: CourseService) { }

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  @Post()
async create(@Body() body: any) {
  return this.courseService.create(body);
}

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    return this.courseService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const course = await this.courseService.remove(id);
    if (!course) throw new NotFoundException('Course not found');
    return { message: 'Course deleted' };
  }
}

