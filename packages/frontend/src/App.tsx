import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/guards';
import { HomePage } from './components/pages/HomePage';
import { LoginPage } from './components/pages/LoginPage';
import { EstudiantesPage, RegisterPage, EditPage } from './components/pages/EstudiantesPage';
import { InscripcionCursosPage } from './components/pages/InscripcionCursosPage';
import { UsuariosPage } from './components/pages/UsuariosPage';
import { CursosPage } from './components/pages/CursosPage';
import { AulasPage } from './components/pages/AulasPage';
import { MiPerfilPage } from './components/pages/MiPerfilPage';
import { MisClasesPage } from './components/pages/MisClasesPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';
import { DepartamentosPage } from './components/pages/DepartamentosPage';
import {
  HorariosPage,
  RegisterPage as HorariosRegisterPage,
  EditPage as HorariosEditPage,
} from "./components/pages/HorariosPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/estudiantes" element={<EstudiantesPage />} />
          <Route path="/estudiantes/registro" element={<RegisterPage />} />
          <Route path="/estudiantes/:id/editar" element={<EditPage />} />
          <Route
            path="/inscripcion-cursos"
            element={<InscripcionCursosPage />}
          />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/horarios" element={<HorariosPage />} />
          <Route path="/horarios/registro" element={<HorariosRegisterPage />} />
          <Route path="/horarios/:id/editar" element={<HorariosEditPage />} />
          <Route path="/mi-perfil" element={<MiPerfilPage />} />
          <Route path="/mis-clases" element={<MisClasesPage />} />
          <Route path="/mis-calificaciones" element={<PlaceholderPage title="Mis calificaciones" />} />
          <Route path="/profesores" element={<PlaceholderPage title="Profesores" />} />
          <Route path="/periodos-academicos" element={<PlaceholderPage title="Períodos académicos" />} />
          <Route path="/programas" element={<PlaceholderPage title="Programas" />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/oferta-cursos" element={<PlaceholderPage title="Oferta de cursos" />} />
          <Route path="/calificaciones" element={<PlaceholderPage title="Calificaciones" />} />
          <Route path="/prerrequisitos" element={<PlaceholderPage title="Prerrequisitos" />} />
          <Route path="/plan-estudios" element={<PlaceholderPage title="Plan de estudios" />} />
          <Route path="/aulas" element={<AulasPage />} />
          <Route path="/inscripciones" element={<PlaceholderPage title="Inscripciones" />} />
          <Route path="/asistencia" element={<PlaceholderPage title="Asistencia" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;