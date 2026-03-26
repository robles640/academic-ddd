import { apiRequest } from '../lib';
import type {
  Schedule,
  CreateScheduleDto,
  UpdateScheduleDto,
} from '../entities';

export type { Schedule, CreateScheduleDto, UpdateScheduleDto } from '../entities';

export type SchedulesPaginatedParams = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type SchedulesPaginatedResponse = {
  data: Schedule[];
  total: number;
};

export async function getSchedulesPaginated(
  params: SchedulesPaginatedParams,
): Promise<SchedulesPaginatedResponse> {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('pageSize', String(params.pageSize));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortOrder) search.set('sortOrder', params.sortOrder);
  return apiRequest<SchedulesPaginatedResponse>(`/schedules?${search.toString()}`, {
    defaultErrorMessage: 'Error al cargar horarios',
  });
}

export async function getSchedules(): Promise<Schedule[]> {
  return apiRequest<Schedule[]>('/schedules', {
    defaultErrorMessage: 'Error al cargar horarios',
  });
}

export async function getSchedule(id: string): Promise<Schedule> {
  try {
    return await apiRequest<Schedule>(`/schedules/${id}`, {
      defaultErrorMessage: 'Horario no encontrado',
    });
  } catch (err) {
    if (err instanceof Error && /not found|no encontrado/i.test(err.message))
      throw new Error('Horario no encontrado');
    throw err;
  }
}

export async function createSchedule(data: CreateScheduleDto): Promise<Schedule> {
  return apiRequest<Schedule>('/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
    defaultErrorMessage: 'Error al crear horario',
  });
}

export async function updateSchedule(
  id: string,
  data: UpdateScheduleDto,
): Promise<Schedule> {
  return apiRequest<Schedule>(`/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    defaultErrorMessage: 'Error al actualizar horario',
  });
}

export async function deleteSchedule(id: string): Promise<void> {
  try {
    await apiRequest<void>(`/schedules/${id}`, {
      method: 'DELETE',
      defaultErrorMessage: 'Error al eliminar horario',
    });
  } catch (err) {
    if (err instanceof Error && /not found|no encontrado/i.test(err.message))
      throw new Error('Horario no encontrado');
    throw err;
  }
}
