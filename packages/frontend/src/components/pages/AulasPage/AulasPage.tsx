import { useEffect, useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { DataTable, type DataTableColumn } from '../../organisms/DataTable';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  type Classroom,
} from '../../../services/classroomService';

const CLASSROOM_COLUMNS: DataTableColumn<Classroom>[] = [
  {
    id: 'code',
    label: 'Codigo',
    value: (row) => row.code,
    render: (row) => <span className="font-medium text-slate-900 dark:text-slate-100">{row.code}</span>,
  },
  { id: 'building', label: 'Edificio', value: (row) => row.building },
  { id: 'capacity', label: 'Capacidad', value: (row) => row.capacity },
];

const emptyForm = {
  code: '',
  building: '',
  capacity: '0',
};

export function AulasPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const rows = await getClassrooms();
      setClassrooms(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar aulas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClassrooms();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code.trim(),
        building: form.building.trim(),
        capacity: Number(form.capacity),
      };
      if (editingId) await updateClassroom(editingId, payload);
      else await createClassroom(payload);
      resetForm();
      await loadClassrooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar aula');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingId(classroom.id);
    setForm({
      code: classroom.code,
      building: classroom.building,
      capacity: String(classroom.capacity),
    });
  };

  const handleDelete = async (classroom: Classroom) => {
    if (!window.confirm(`Eliminar el aula ${classroom.code}?`)) return;
    setDeletingId(classroom.id);
    setError(null);
    try {
      await deleteClassroom(classroom.id);
      if (editingId === classroom.id) resetForm();
      await loadClassrooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar aula');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,400px)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Aulas
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Administra el catalogo de aulas disponibles para los horarios.
          </p>
          <div className="mt-6">
            <DataTable<Classroom>
              columns={CLASSROOM_COLUMNS}
              data={classrooms}
              keyExtractor={(row) => row.id}
              defaultPageSize={500}
              emptyMessage="No hay aulas registradas."
              renderActions={(row) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                  >
                    {deletingId === row.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              )}
            />
          </div>
          {loading && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Cargando...</p>}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingId ? 'Editar aula' : 'Nueva aula'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Codigo
              </label>
              <Input
                id="code"
                required
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                placeholder="Ej. A-101"
              />
            </div>
            <div>
              <label htmlFor="building" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Edificio
              </label>
              <Input
                id="building"
                required
                value={form.building}
                onChange={(event) => setForm((prev) => ({ ...prev, building: event.target.value }))}
                placeholder="Ej. Bloque A"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Capacidad
              </label>
              <Input
                id="capacity"
                type="number"
                min="1"
                required
                value={form.capacity}
                onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar aula' : 'Crear aula'}
              </Button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </div>
    </MainLayout>
  );
}
