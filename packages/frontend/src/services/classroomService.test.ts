import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from './classroomService';

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

describe('classroomService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('getClassrooms devuelve la lista', async () => {
    const classrooms = [{ id: '1', code: 'A-101', building: 'Bloque A', capacity: 40 }];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRes({ body: classrooms }));

    await expect(getClassrooms()).resolves.toEqual(classrooms);
  });

  it('createClassroom envía POST', async () => {
    const dto = { code: 'B-202', building: 'Bloque B', capacity: 30 };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ body: { id: '1', ...dto } }),
    );

    await createClassroom(dto);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/classrooms'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(dto) }),
    );
  });

  it('updateClassroom envía PATCH', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ body: { id: '1', code: 'A-101', building: 'Bloque A', capacity: 50 } }),
    );

    await updateClassroom('1', { capacity: 50 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/classrooms/1'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('deleteClassroom traduce 404', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockRes({ ok: false, status: 404, body: { message: 'Classroom not found' } }),
    );

    await expect(deleteClassroom('missing')).rejects.toThrow('Aula no encontrada');
  });
});
