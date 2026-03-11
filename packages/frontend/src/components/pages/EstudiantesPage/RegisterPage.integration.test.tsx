import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import * as studentService from '../../../services/studentService';

// Mock del servicio de estudiantes
vi.mock('../../../services/studentService', () => ({
  createStudent: vi.fn(),
}));

const mockCreateStudent = vi.mocked(studentService.createStudent);

// Wrapper con router para que useNavigate funcione
function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/estudiantes/registro']}>
      <Routes>
        <Route path="/estudiantes/registro" element={<RegisterPage />} />
        <Route
          path="/estudiantes"
          element={<div data-testid="estudiantes-list-page">Lista de estudiantes</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RegisterPage (integración)', () => {
  const studentData = {
    firstName: 'María',
    lastName: 'García López',
    document: '12345678',
    birthDate: '2000-05-15',
    email: 'maria.garcia@correo.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateStudent.mockResolvedValue({
      id: 'student-1',
      ...studentData,
      birthDate: studentData.birthDate,
      code: 'ALUMNO-00001',
      userId: 'user-1',
    });
  });

  it('permite completar el formulario y crear un estudiante; luego redirige a /estudiantes', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    expect(screen.getByRole('heading', { name: /agregar estudiante/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar alumno/i })).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/nombre/i);
    const lastNameInput = screen.getByLabelText(/apellidos/i);
    const documentInput = screen.getByLabelText(/documento/i);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const birthDateInput = screen.getByLabelText(/fecha de nacimiento/i);

    await user.type(firstNameInput, studentData.firstName);
    await user.type(lastNameInput, studentData.lastName);
    await user.type(documentInput, studentData.document);
    await user.type(emailInput, studentData.email);
    await user.type(birthDateInput, studentData.birthDate);

    const submitButton = screen.getByRole('button', { name: /registrar alumno/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateStudent).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateStudent).toHaveBeenCalledWith({
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      document: studentData.document,
      birthDate: studentData.birthDate,
      email: studentData.email,
    });

    await waitFor(() => {
      expect(screen.getByTestId('estudiantes-list-page')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error cuando createStudent falla', async () => {
    const user = userEvent.setup();
    mockCreateStudent.mockRejectedValueOnce(new Error('Documento duplicado'));

    renderRegisterPage();

    await user.type(screen.getByLabelText(/nombre/i), studentData.firstName);
    await user.type(screen.getByLabelText(/apellidos/i), studentData.lastName);
    await user.type(screen.getByLabelText(/documento/i), studentData.document);
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), studentData.birthDate);

    await user.click(screen.getByRole('button', { name: /registrar alumno/i }));

    await waitFor(() => {
      expect(screen.getByText('Documento duplicado')).toBeInTheDocument();
    });

    expect(mockCreateStudent).toHaveBeenCalledTimes(1);
    // No debe haber navegado
    expect(screen.queryByTestId('estudiantes-list-page')).not.toBeInTheDocument();
  });

  it('al hacer clic en Cancelar navega a /estudiantes sin crear', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.getByTestId('estudiantes-list-page')).toBeInTheDocument();
    });

    expect(mockCreateStudent).not.toHaveBeenCalled();
  });

  it('deshabilita el botón de envío mientras está cargando', async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: unknown) => void;
    mockCreateStudent.mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; }),
    );

    renderRegisterPage();

    await user.type(screen.getByLabelText(/nombre/i), studentData.firstName);
    await user.type(screen.getByLabelText(/apellidos/i), studentData.lastName);
    await user.type(screen.getByLabelText(/documento/i), studentData.document);
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), studentData.birthDate);

    await user.click(screen.getByRole('button', { name: /registrar alumno/i }));

    expect(screen.getByRole('button', { name: /registrando/i })).toBeDisabled();

    (resolveCreate!)({
      id: 'student-1',
      ...studentData,
      code: 'ALUMNO-00001',
      userId: 'user-1',
    });

    await waitFor(() => {
      expect(screen.getByTestId('estudiantes-list-page')).toBeInTheDocument();
    });
  });
});
