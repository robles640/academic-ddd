import { useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { changePassword } from '../../../services/authService';
import { IconEye, IconEyeOff } from '../../../assets/icons';


import { useEffect} from "react";
import { Student } from "../../../entities/student"
import {
  getStudents,
  getStudent,
  updateStudentBirthDate,
  updateStudentUserEmail,
} from './../../../services/studentService';

export function MiPerfilPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    // Obtener userId desde localStorage
    const academicUser = localStorage.getItem("academic_user");
    const userId = academicUser ? JSON.parse(academicUser).id : null;

    if (!userId) {
      console.error("No se encontró userId en localStorage");
      return;
    }

    try {
      // Obtener todos los estudiantes
      const students: Student[] = await getStudents();

      // Buscar el estudiante con userId
      const myStudent = students.find((s) => s.userId === userId);
      if (!myStudent) {
        console.error("No se encontró un estudiante con este userId");
        return;
      }

      // Obtener datos completos del estudiante      
      const data: Student = await getStudent(myStudent.id);

      setStudent(data);
      setBirthDate(data.birthDate.split("T")[0]); // YYYY-MM-DD
      setEmail(data.email || "");
    } catch (error) {
      console.error("Error cargando estudiante:", error);
    }
  }

  async function handleSave() {
    if (!student) return;

    try {
      // PATCH birthDate      
      await updateStudentBirthDate(student.id,birthDate);

      // PATCH email
      await updateStudentUserEmail(student.userId,email);

      alert("Datos actualizados correctamente");
      loadStudent(); // recargar para reflejar cambios
    } catch (error) {
      console.error("Error guardando datos:", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La confirmación de la contraseña no coincide');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(
        result.message === 'Password updated successfully'
          ? 'Contraseña actualizada correctamente'
          : result.message,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cambiar la contraseña';
      setError(
        message === 'Current password is invalid'
          ? 'La contraseña actual no es correcta'
          : message === 'Password confirmation does not match'
            ? 'La confirmación de la contraseña no coincide'
            : message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return <MainLayout>Cargando...</MainLayout>;
  }

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-2xl font-bold">Mi Perfil</h2>

        <div className="mt-4 space-y-2">
          <p>
            <b>Nombre:</b> {student.firstName} {student.lastName}
          </p>
          <p>
            <b>Documento:</b> {student.document}
          </p>
          <p>
            <b>Código:</b> {student.code}
          </p>

          <div>
            <label>
              <b>Email: </b>
            </label>
            <input
              className="border p-2 ml-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>
              <b>Fecha nacimiento: </b>
            </label>
            <input
              type="date"
              className="border p-2 ml-2"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSave}
          >
            Guardar
          </Button>

        </div>  

        <div className="mt-8 border-t border-slate-200/80 pt-8 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cambiar contraseña
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Ingresa tu contraseña actual y define una nueva contraseña segura.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-xl">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contraseña actual
              </label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Nueva contraseña
              </label>
              <div className="flex gap-2">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                  aria-label={
                    showNewPassword
                      ? 'Ocultar nueva contraseña'
                      : 'Ver nueva contraseña'
                  }
                >
                  {showNewPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Repetir contraseña
              </label>
              <div className="flex gap-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/50"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar repetición de contraseña'
                      : 'Ver repetición de contraseña'
                  }
                >
                  {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {success}
              </p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </div>  
      </div>
    </MainLayout>
  );
}
