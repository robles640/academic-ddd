import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomService } from '../../../contexts/academic/classroom/application/classroom.service';
import { Classroom } from '../../../contexts/academic/classroom/domain/classroom.entity';

describe('ClassroomsController', () => {
  let controller: ClassroomsController;
  let classroomService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const classroom = new Classroom('classroom-1', 'A-101', 'Bloque A', 40);

  beforeEach(async () => {
    classroomService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomsController],
      providers: [{ provide: ClassroomService, useValue: classroomService }],
    }).compile();

    controller = module.get<ClassroomsController>(ClassroomsController);
  });

  it('findAll devuelve aulas', async () => {
    classroomService.findAll.mockResolvedValue([classroom]);
    await expect(controller.findAll()).resolves.toEqual([classroom]);
  });

  it('findOne lanza not found si falta', async () => {
    classroomService.findById.mockResolvedValue(null);
    await expect(controller.findOne('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create delega al servicio', async () => {
    classroomService.create.mockResolvedValue(classroom);
    await expect(
      controller.create({ code: 'A-101', building: 'Bloque A', capacity: 40 }),
    ).resolves.toEqual(classroom);
  });

  it('update devuelve aula actualizada', async () => {
    classroomService.update.mockResolvedValue(classroom);
    await expect(
      controller.update('classroom-1', { capacity: 50 }),
    ).resolves.toEqual(classroom);
  });

  it('remove lanza not found si no existe', async () => {
    classroomService.delete.mockResolvedValue(false);
    await expect(controller.remove('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
