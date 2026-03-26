import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { ScheduleService } from '../../../contexts/academic/schedule/application/schedule.service';
import { Schedule } from '../../../contexts/academic/schedule/domain/schedule.entity';

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let scheduleService: {
    findAllWithCourseInfo: jest.Mock;
    findPaginatedWithUserInfo: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const schedule = new Schedule(
    'schedule-1',
    'course-1',
    'Lunes 08:00-10:00',
    'classroom-1',
  );
  const mockSchedule = new Schedule(
    'schedule-1',
    'course-1',
    'Lunes 09:00-11:00',
    'classroom-1',
  );
  const mockScheduleWithCourse = {
    ...mockSchedule,
    courseName: 'Matemática',
  };

  beforeEach(async () => {
    scheduleService = {
      findAllWithCourseInfo: jest.fn(),
      findPaginatedWithUserInfo: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [{ provide: ScheduleService, useValue: scheduleService }],
    }).compile();

    controller = module.get<SchedulesController>(SchedulesController);
  });

  describe('findAll', () => {
    it('debería devolver todos los horarios sin paginación', async () => {
      scheduleService.findAllWithCourseInfo.mockResolvedValue([mockScheduleWithCourse]);
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect((result as typeof mockScheduleWithCourse[]).length).toBe(1);
      expect(scheduleService.findAllWithCourseInfo).toHaveBeenCalledTimes(1);
    });

    it('debería devolver paginado cuando se envían page y pageSize', async () => {
      scheduleService.findPaginatedWithUserInfo.mockResolvedValue({
        data: [mockScheduleWithCourse],
        total: 1,
      });
      const result = await controller.findAll('1', '10', 'slot', 'asc');
      expect(result).toEqual({ data: [mockScheduleWithCourse], total: 1 });
      expect(scheduleService.findPaginatedWithUserInfo).toHaveBeenCalledWith(
        1,
        10,
        'slot',
        'asc',
      );
    });
  });

  describe('findOne', () => {
    it('debería devolver un horario si existe', async () => {
      scheduleService.findById.mockResolvedValue(mockSchedule);
      const result = await controller.findOne('schedule-1');
      expect(result).toEqual(mockSchedule);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      scheduleService.findById.mockResolvedValue(null);
      await expect(controller.findOne('inexistente')).rejects.toThrow(NotFoundException);
      await expect(controller.findOne('inexistente')).rejects.toThrow(
        'Schedule not found',
      );
    });
  });

  describe('create', () => {
    it('debería crear un horario y devolverlo', async () => {
      const body = {
        courseId: 'course-1',
        slot: 'Lunes 09:00-11:00',
        classroomId: 'classroom-1',
      };
      scheduleService.create.mockResolvedValue(mockSchedule);
      const result = await controller.create(body);
      expect(scheduleService.create).toHaveBeenCalledWith(body);
      expect(result).toEqual(mockSchedule);
    });
  });

  describe('update', () => {
    it('debería actualizar y devolver el horario', async () => {
      const body = { slot: 'Martes 14:00-16:00', classroomId: 'classroom-2' };
      const updated = new Schedule(
        'schedule-1',
        'course-1',
        'Martes 14:00-16:00',
        'classroom-2',
      );
      scheduleService.update.mockResolvedValue(updated);
      const result = await controller.update('schedule-1', body);
      expect(scheduleService.update).toHaveBeenCalledWith('schedule-1', body);
      expect(result.slot).toBe('Martes 14:00-16:00');
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      scheduleService.update.mockResolvedValue(null);
      await expect(
        controller.update('inexistente', { slot: 'Lunes 10:00-12:00' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un horario', async () => {
      scheduleService.delete.mockResolvedValue(true);
      await expect(controller.remove('schedule-1')).resolves.toBeUndefined();
      expect(scheduleService.delete).toHaveBeenCalledWith('schedule-1');
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      scheduleService.delete.mockResolvedValue(false);
      await expect(controller.remove('inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});
