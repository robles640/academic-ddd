import { apiRequest } from '../lib';
import type {
  Classroom,
  CreateClassroomDto,
  UpdateClassroomDto,
} from '../entities';

export type { Classroom, CreateClassroomDto, UpdateClassroomDto } from '../entities';

export async function getClassrooms(): Promise<Classroom[]> {
  return apiRequest<Classroom[]>('/classrooms', {
    defaultErrorMessage: 'Error al cargar aulas',
  });
}

export async function getClassroom(id: string): Promise<Classroom> {
  try {
    return await apiRequest<Classroom>(`/classrooms/${id}`, {
      defaultErrorMessage: 'Aula no encontrada',
    });
  } catch (err) {
    if (err instanceof Error && /not found|no encontrada/i.test(err.message))
      throw new Error('Aula no encontrada');
    throw err;
  }
}

export async function createClassroom(
  data: CreateClassroomDto,
): Promise<Classroom> {
  return apiRequest<Classroom>('/classrooms', {
    method: 'POST',
    body: JSON.stringify(data),
    defaultErrorMessage: 'Error al crear aula',
  });
}

export async function updateClassroom(
  id: string,
  data: UpdateClassroomDto,
): Promise<Classroom> {
  return apiRequest<Classroom>(`/classrooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    defaultErrorMessage: 'Error al actualizar aula',
  });
}

export async function deleteClassroom(id: string): Promise<void> {
  try {
    await apiRequest<void>(`/classrooms/${id}`, {
      method: 'DELETE',
      defaultErrorMessage: 'Error al eliminar aula',
    });
  } catch (err) {
    if (err instanceof Error && /not found|no encontrada/i.test(err.message))
      throw new Error('Aula no encontrada');
    throw err;
  }
}
