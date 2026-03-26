import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomService } from './classroom.service';
import { CLASSROOM_REPOSITORY } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';

describe('ClassroomService', () => {
  let service: ClassroomService;
  let classroomRepo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  const classroom = new Classroom('classroom-1', 'A-101', 'Bloque A', 40);

  beforeEach(async () => {
    classroomRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        { provide: CLASSROOM_REPOSITORY, useValue: classroomRepo },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  it('findAll devuelve aulas', async () => {
    classroomRepo.findAll.mockResolvedValue([classroom]);
    await expect(service.findAll()).resolves.toEqual([classroom]);
  });

  it('create crea y guarda un aula', async () => {
    classroomRepo.save.mockImplementation(async (value: Classroom) => value);
    const result = await service.create({
      code: 'B-202',
      building: 'Bloque B',
      capacity: 35,
    });

    expect(result.code).toBe('B-202');
    expect(result.building).toBe('Bloque B');
    expect(result.capacity).toBe(35);
    expect(classroomRepo.save).toHaveBeenCalledTimes(1);
  });

  it('update devuelve null si no existe', async () => {
    classroomRepo.findById.mockResolvedValue(null);
    await expect(service.update('missing', { code: 'X' })).resolves.toBeNull();
  });

  it('update modifica y guarda el aula', async () => {
    classroomRepo.findById.mockResolvedValue(classroom);
    classroomRepo.save.mockImplementation(async (value: Classroom) => value);

    const result = await service.update('classroom-1', { capacity: 55 });

    expect(result?.capacity).toBe(55);
    expect(classroomRepo.save).toHaveBeenCalledWith(classroom);
  });

  it('delete devuelve false si no existe', async () => {
    classroomRepo.findById.mockResolvedValue(null);
    await expect(service.delete('missing')).resolves.toBe(false);
  });

  it('delete elimina el aula si existe', async () => {
    classroomRepo.findById.mockResolvedValue(classroom);
    classroomRepo.delete.mockResolvedValue(undefined);

    await expect(service.delete('classroom-1')).resolves.toBe(true);
    expect(classroomRepo.delete).toHaveBeenCalledWith('classroom-1');
  });
});
