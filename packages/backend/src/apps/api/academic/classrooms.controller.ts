import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ClassroomService } from '../../../contexts/academic/classroom/application/classroom.service';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get()
  async findAll() {
    return this.classroomService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const classroom = await this.classroomService.findById(id);
    if (!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
  }

  @Post()
  async create(
    @Body()
    body: { code: string; building: string; capacity: number },
  ) {
    return this.classroomService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: { code?: string; building?: string; capacity?: number },
  ) {
    const classroom = await this.classroomService.update(id, body);
    if (!classroom) throw new NotFoundException('Classroom not found');
    return classroom;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.classroomService.delete(id);
    if (!deleted) throw new NotFoundException('Classroom not found');
  }
}
