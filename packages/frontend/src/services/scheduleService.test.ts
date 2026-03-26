import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from './scheduleService';

function mockRes(overrides: {
  ok?: boolean;
  body?: unknown;
  status?: number;
} = {}) {
  const ok = overrides.ok ?? true;
  const body = overrides.body !== undefined ? JSON.stringify(overrides.body) : '';
  return {
    ok,
    status: overrides.status,
    json: () => Promise.resolve(overrides.body),
    text: () => Promise.resolve(body),
  };
}

vi.mock('../stores', () => ({
  useAuthStore: {
    getState: () => ({
      clearAuth: vi.fn(),
    }),
  },
}));

describe('scheduleService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('getSchedules devuelve la lista', async () => {
    const schedules = [
      {
        id: '1',
        courseId: 'course-1',
        slot: 'Lunes 08:00-10:00',
        classroomId: 'classroom-1',
      },
    ];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRes({ body: schedules }));

    await expect(getSchedules()).resolves.toEqual(schedules);
  });

  it('createSchedule envía POST', async () => {
    const dto = {
      courseId: 'course-1',
      slot: 'Lunes 08:00-10:00',
      classroomId: 'classroom-1',
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ body: { id: '1', ...dto } }),
    );

    await createSchedule(dto);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/schedules'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(dto) }),
    );
  });

  it('updateSchedule envía PATCH', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({
        body: {
          id: '1',
          courseId: 'course-1',
          slot: 'Martes 10:00-12:00',
          classroomId: 'classroom-2',
        },
      }),
    );

    await updateSchedule('1', { slot: 'Martes 10:00-12:00' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/schedules/1'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('deleteSchedule traduce 404', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ ok: false, status: 404, body: { message: 'Schedule not found' } }),
    );

    await expect(deleteSchedule('missing')).rejects.toThrow('Horario no encontrado');
  });
});
