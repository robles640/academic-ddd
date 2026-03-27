import { Controller, Get, Post, Patch, Delete, Body, Param, NotFoundException, SetMetadata } from '@nestjs/common';
import { DepartmentService } from '../../../contexts/academic/department/application/department.service';

// ESTA LÍNEA ES LA MAGIA QUE EVITA QUE TE BOTEN AL LOGIN
@SetMetadata('isPublic', true)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  async findAll() { return this.departmentService.findAll(); }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dept = await this.departmentService.findById(id);
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  @Post()
  async create(@Body() body: { name: string; code: string; parentId?: string }) {
    return this.departmentService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; code?: string; parentId?: string }) {
    const dept = await this.departmentService.update(id, body);
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.departmentService.delete(id);
    if (!deleted) throw new NotFoundException('Department not found');
  }
}