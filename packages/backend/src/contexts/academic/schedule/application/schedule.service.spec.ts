import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { SCHEDULE_REPOSITORY } from '../domain/schedule.repository';
import { CourseService } from '../../course/application/course.service';
import { Schedule } from '../domain/schedule.entity';
import { BadRequestException } from '@nestjs/common';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleRepo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findPaginated: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let courseService: {
    findById: jest.Mock;
  };
  
  const schedule = new Schedule(
    'schedule-1',
    'course-1',
    'Lunes 08:00-10:00',
    'classroom-1',
  );

  const mockCourse = { id: 'course-1', name: 'Matemática' };
  const mockSchedule = new Schedule(
    'schedule-1',
    'course-1',
    'Lunes 09:00-11:00',
    'classroom-1',
  );

  beforeEach(async () => {
    scheduleRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    courseService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: SCHEDULE_REPOSITORY, useValue: scheduleRepo },
        { provide: CourseService, useValue: courseService },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  describe('findAll', () => {
    it('debería devolver todos los horarios', async () => {
      scheduleRepo.findAll.mockResolvedValue([mockSchedule]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('schedule-1');
      expect(scheduleRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('debería devolver un horario por ID', async () => {
      scheduleRepo.findById.mockResolvedValue(mockSchedule);
      const result = await service.findById('schedule-1');
      expect(result).toEqual(mockSchedule);
      expect(scheduleRepo.findById).toHaveBeenCalledWith('schedule-1');
    });

    it('debería devolver null si no existe', async () => {
      scheduleRepo.findById.mockResolvedValue(null);
      const result = await service.findById('inexistente');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createData = {
      courseId: 'course-1',
      slot: 'Lunes 09:00-11:00',
      classroomId: 'classroom-1',
    };

    beforeEach(() => {
      courseService.findById.mockResolvedValue(mockCourse);
      scheduleRepo.findAll.mockResolvedValue([]);
      scheduleRepo.save.mockImplementation((s: Schedule) => Promise.resolve(s));
    });

    it('debería crear un horario válido', async () => {
      const result = await service.create(createData);
      expect(result.courseId).toBe('course-1');
      expect(result.slot).toBe('Lunes 09:00-11:00');
      expect(scheduleRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar si el curso no existe', async () => {
      courseService.findById.mockResolvedValue(null);
      await expect(service.create(createData)).rejects.toThrow(BadRequestException);
      await expect(service.create(createData)).rejects.toThrow(
        'El curso con ID course-1 no existe',
      );
    });

    it('debería lanzar si ya existe un horario duplicado', async () => {
      scheduleRepo.findAll.mockResolvedValue([mockSchedule]);
      await expect(service.create(createData)).rejects.toThrow(BadRequestException);
      await expect(service.create(createData)).rejects.toThrow(
        'Ya existe un horario igual para este curso',
      );
    });

    it('debería lanzar si hay horarios superpuestos', async () => {
      scheduleRepo.findAll.mockResolvedValue([
        new Schedule('s1', 'course-1', 'Lunes 08:00-10:00', 'classroom-2'),
      ]);
      await expect(service.create(createData)).rejects.toThrow(BadRequestException);
      await expect(service.create(createData)).rejects.toThrow(
        'El horario se superpone con otro existente en el mismo curso',
      );
    });
  });

  describe('update', () => {
    const updateData = { slot: 'Martes 14:00-16:00' };

    beforeEach(() => {
      scheduleRepo.findById.mockResolvedValue(mockSchedule);
      scheduleRepo.findAll.mockResolvedValue([]);
      courseService.findById.mockResolvedValue(mockCourse);
      scheduleRepo.save.mockImplementation((s: Schedule) => Promise.resolve(s));
    });

    it('debería actualizar un horario', async () => {
      const result = await service.update('schedule-1', updateData);
      expect(result?.slot).toBe('Martes 14:00-16:00');
      expect(scheduleRepo.save).toHaveBeenCalled();
    });

    it('debería devolver null si no existe', async () => {
      scheduleRepo.findById.mockResolvedValue(null);
      const result = await service.update('inexistente', updateData);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('debería eliminar un horario', async () => {
      scheduleRepo.findById.mockResolvedValue(mockSchedule);
      scheduleRepo.delete.mockResolvedValue(undefined);
      const result = await service.delete('schedule-1');
      expect(result).toBe(true);
      expect(scheduleRepo.delete).toHaveBeenCalledWith('schedule-1');
    });

    it('debería devolver false si no existe', async () => {
      scheduleRepo.findById.mockResolvedValue(null);
      const result = await service.delete('inexistente');
      expect(result).toBe(false);
    });
  });
});
