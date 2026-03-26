import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MiPerfilPage } from './MiPerfilPage';
import * as authService from '../../../services/authService';
import * as studentService from '../../../services/studentService';

vi.mock('../../../services/authService', () => ({
  changePassword: vi.fn(),
}));

vi.mock('../../../services/studentService', () => ({
  getStudents: vi.fn(),
  getStudent: vi.fn(),
  updateStudentBirthDate: vi.fn(),
  updateStudentUserEmail: vi.fn(),
}));

vi.mock('../../../stores', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../stores')>();
  return {
    ...actual,
    useAuthStore: vi.fn((selector) =>
      selector({
        user: {
          id: 'user-1',
          name: 'admin',
          email: 'admin@academic.local',
          role: 'ADMINISTRATOR',
        },
      })),
    useThemeStore: vi.fn((selector) =>
      selector({
        theme: 'light',
        toggleTheme: vi.fn(),
        setTheme: vi.fn(),
      })),
  };
});

const mockChangePassword = vi.mocked(authService.changePassword);
const mockGetStudents = vi.mocked(studentService.getStudents);
const mockGetStudent = vi.mocked(studentService.getStudent);

describe('MiPerfilPage', () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <MiPerfilPage />
      </MemoryRouter>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'academic_user',
      JSON.stringify({ id: 'user-1', role: 'ADMINISTRATOR' }),
    );
    mockGetStudents.mockResolvedValue([
      {
        id: 'student-1',
        userId: 'user-1',
        firstName: 'Admin',
        lastName: 'User',
        document: '12345678',
        code: '20240001',
        birthDate: '2000-01-01T00:00:00.000Z',
        email: 'admin@academic.local',
      },
    ]);
    mockGetStudent.mockResolvedValue({
      id: 'student-1',
      userId: 'user-1',
      firstName: 'Admin',
      lastName: 'User',
      document: '12345678',
      code: '20240001',
      birthDate: '2000-01-01T00:00:00.000Z',
      email: 'admin@academic.local',
    });
  });

  it('envía el formulario y muestra mensaje de éxito', async () => {
    const user = userEvent.setup();
    mockChangePassword.mockResolvedValue({
      message: 'Password updated successfully',
    });

    renderPage();

    await user.type(
      await screen.findByLabelText(/contraseña actual/i, { selector: 'input' }),
      'Actual123!',
    );
    await user.type(
      screen.getByLabelText(/^nueva contraseña$/i, { selector: 'input' }),
      'Nueva123!',
    );
    await user.type(
      screen.getByLabelText(/repetir contraseña/i, { selector: 'input' }),
      'Nueva123!',
    );
    await user.click(
      screen.getByRole('button', { name: /actualizar contraseña/i }),
    );

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'Actual123!',
        newPassword: 'Nueva123!',
        confirmPassword: 'Nueva123!',
      });
    });

    expect(
      await screen.findByText('Contraseña actualizada correctamente'),
    ).toBeInTheDocument();
  });

  it('valida que la confirmación coincida antes de enviar', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      await screen.findByLabelText(/contraseña actual/i, { selector: 'input' }),
      'Actual123!',
    );
    await user.type(
      screen.getByLabelText(/^nueva contraseña$/i, { selector: 'input' }),
      'Nueva123!',
    );
    await user.type(
      screen.getByLabelText(/repetir contraseña/i, { selector: 'input' }),
      'Otra123!',
    );
    await user.click(
      screen.getByRole('button', { name: /actualizar contraseña/i }),
    );

    expect(mockChangePassword).not.toHaveBeenCalled();
    expect(
      screen.getByText('La confirmación de la contraseña no coincide'),
    ).toBeInTheDocument();
  });

  it('permite mostrar y ocultar las contraseñas', async () => {
    const user = userEvent.setup();

    renderPage();

    const currentPasswordInput = (await screen.findByLabelText(
      /contraseña actual/i,
      { selector: 'input' },
    )) as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(
      /^nueva contraseña$/i,
      { selector: 'input' },
    ) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      /repetir contraseña/i,
      { selector: 'input' },
    ) as HTMLInputElement;

    expect(currentPasswordInput.type).toBe('password');
    expect(newPasswordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');
    expect(
      screen.queryByRole('button', { name: /ver contraseña actual/i }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /ver nueva contraseña/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /ver repetición de contraseña/i }),
    );

    expect(currentPasswordInput.type).toBe('password');
    expect(newPasswordInput.type).toBe('text');
    expect(confirmPasswordInput.type).toBe('text');

    await user.click(
      screen.getByRole('button', { name: /ocultar nueva contraseña/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /ocultar repetición de contraseña/i }),
    );

    expect(currentPasswordInput.type).toBe('password');
    expect(newPasswordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');
  });
});
