import { useEffect, useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../../services/courseService';

export function CursosPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    code: '',
    credits: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const res: any = await getCourses();
    setCourses(res.data ?? res);
  }

  function openModal(course?: any) {
    if (course) {
      setForm(course);
      setEditingId(course.id);
    } else {
      setForm({ name: '', code: '', credits: 0 });
      setEditingId(null);
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setError('');
  }

  function validate() {
    if (!form.name || !form.code || form.credits <= 0) {
      setError('Todos los campos son obligatorios');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!validate()) return;
    if (editingId) {
      await updateCourse(editingId, form);
    } else {
      await createCourse(form);
    }

    closeModal();
    loadCourses();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar curso?')) return;
    await deleteCourse(id);
    loadCourses();
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Cursos
          </h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
          >
            + Agregar curso
          </button>
        </div>

        {/* GRID DE CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold">{c.name}</h3>
              <p className="text-sm text-slate-500">{c.code}</p>
              <p className="mt-2 font-medium">
                Créditos: {c.credits}
              </p>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => openModal(c)}
                  className="text-blue-500 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-500 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-96 shadow-xl">
              <h3 className="text-xl font-bold mb-4">
                {editingId ? 'Editar curso' : 'Nuevo curso'}
              </h3>

              {error && (
                <p className="text-red-500 text-sm mb-2">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Nombre"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <input
                  className="w-full border p-2 rounded"
                  placeholder="Código"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value })
                  }
                />

                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Créditos"
                  value={form.credits}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      credits: Number(e.target.value),
                    })
                  }
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 py-2 text-gray-500"
                  >
                    Cancelar
                  </button>

                  <button className="bg-blue-600 text-white px-4 py-2 rounded-xl">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}