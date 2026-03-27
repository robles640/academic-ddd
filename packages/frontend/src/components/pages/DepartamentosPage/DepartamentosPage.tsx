import { useEffect, useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { apiRequest } from '../../../lib'; 
import mixpanel from 'mixpanel-browser';

// Inicializamos Mixpanel con tu Token
mixpanel.init('e6a058577918b4507eef4b93a9596e4b', { debug: true, track_pageview: true });

export function DepartamentosPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', parentId: '' });

  // EVENTO DE MIXPANEL: Se dispara al entrar a la página
  useEffect(() => {
    mixpanel.track('Visito_Pagina_Departamentos_Alan');
  }, []);

  const load = async () => {
    try {
      const data = await apiRequest<any[]>('/departments');
      setDepartments(data || []);
    } catch (e) { console.error("Error al cargar:", e); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) return alert("Nombre y Código obligatorios");

    // Limpiamos el parentId: si es string vacío, mandamos null
    const payload = {
      name: form.name,
      code: form.code,
      parentId: form.parentId === "" ? null : form.parentId
    };

    try {
      if (editingId) {
        // EDITAR (PATCH)
        await apiRequest(`/departments/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        mixpanel.track('Edito_Departamento', { nombre: form.name }); // Rastreo extra
      } else {
        // CREAR (POST)
        await apiRequest('/departments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        mixpanel.track('Creo_Departamento', { nombre: form.name }); // Rastreo extra
      }
      
      setForm({ name: '', code: '', parentId: '' });
      setEditingId(null);
      await load();
      alert("¡Operación exitosa!");
    } catch (e: any) {
      alert("Error del servidor: " + (e.message || "Error al procesar"));
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este departamento?")) return;
    try {
      await apiRequest(`/departments/${id}`, { method: 'DELETE' });
      mixpanel.track('Elimino_Departamento'); // Rastreo extra
      load();
    } catch (e) { alert("Error al eliminar"); }
  };

  const startEdit = (dept: any) => {
    setEditingId(dept.id);
    setForm({ 
      name: dept.name, 
      code: dept.code, 
      parentId: dept.parentId || '' 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="p-8 bg-white min-h-screen text-black">
        <h2 className="text-3xl font-extrabold mb-2 text-slate-800">Departamentos y Facultades</h2>
        <p className="text-slate-500 mb-8 font-medium">Gestión de jerarquía académica (CRUD Completo).</p>
        
        {/* FORMULARIO */}
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 mb-8 shadow-sm">
          <h3 className="text-xs font-black text-indigo-600 mb-4 uppercase tracking-widest">
            {editingId ? '📝 Editando Registro' : '✨ Crear Nuevo'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre</label>
              <input className="w-full border-2 p-2.5 rounded-xl bg-white focus:border-indigo-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ej. Facultad de Tecnología" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Código</label>
              <input className="w-full border-2 p-2.5 rounded-xl bg-white focus:border-indigo-500 outline-none" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="TEC-01" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Depende de (Padre)</label>
              <select className="w-full border-2 p-2.5 rounded-xl bg-white focus:border-indigo-500 outline-none" value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})}>
                <option value="">Ninguno (Es Raíz)</option>
                {departments.filter(d => d.id !== editingId).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                {editingId ? 'ACTUALIZAR' : 'CREAR'}
              </button>
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setForm({name:'', code:'', parentId:''})}} className="bg-slate-200 text-slate-600 p-2.5 rounded-xl font-bold">✖</button>
              )}
            </div>
          </form>
        </div>

        {/* TABLA */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr>
                <th className="p-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Departamento / Relación</th>
                <th className="p-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider">Código</th>
                <th className="p-4 font-bold text-slate-500 text-[11px] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-all">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{d.name}</div>
                    {d.parentId && (
                      <div className="text-[10px] text-indigo-500 font-black mt-0.5">
                        ↳ SUB-UNIDAD DE: {departments.find(p => p.id === d.parentId)?.name.toUpperCase() || '---'}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-sm">{d.code}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(d)} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-bold text-xs mr-2 hover:bg-blue-600 hover:text-white transition-all">EDITAR</button>
                    <button onClick={() => handleDelete(d.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded-md font-bold text-xs hover:bg-red-600 hover:text-white transition-all">BORRAR</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}