import { NavLink } from 'react-router-dom';
import { useAuthStore, type Role } from '../../../stores';
import {
  IconUsers,
  IconAcademic,
  IconCourses,
  IconCalendar,
  IconUser,
  IconClipboard,
  IconAcademicCap,
  IconLogout,
  IconClose,
} from '../../../assets/icons';

type MenuItem = { to: string; label: string; icon: React.ReactNode };

const iconClass = 'h-5 w-5 shrink-0';

const icons = {
  users: <IconUsers className={iconClass} />,
  academic: <IconAcademic className={iconClass} />,
  courses: <IconCourses className={iconClass} />,
  calendar: <IconCalendar className={iconClass} />,
  user: <IconUser className={iconClass} />,
  clipboard: <IconClipboard className={iconClass} />,
  academicCap: <IconAcademicCap className={iconClass} />,
  logout: <IconLogout className={iconClass} />,
};

const MENU_BY_ROLE: Record<Role, MenuItem[]> = {
  ADMINISTRATOR: [
    { to: '/usuarios', label: 'Usuarios', icon: icons.users },
    { to: '/estudiantes', label: 'Estudiantes', icon: icons.academic },
    { to: '/cursos', label: 'Cursos', icon: icons.courses },
    { to: '/horarios', label: 'Horarios', icon: icons.calendar },
  ],
  STUDENT: [
    { to: '/mi-perfil', label: 'Mi perfil', icon: icons.user },
    { to: '/inscripcion-cursos', label: 'Inscripción', icon: icons.clipboard },
    { to: '/mis-clases', label: 'Mis clases', icon: icons.academicCap },
  ],
  TEACHER: [
    { to: '/mi-perfil', label: 'Mi perfil', icon: icons.user },
    { to: '/mis-clases', label: 'Mis clases', icon: icons.academicCap },
  ],
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-700/60'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const items = user ? MENU_BY_ROLE[user.role] : [];

  if (items.length === 0) return null;

  const handleLogout = () => {
    clearAuth();
    onNavigate?.();
  };

  return (
    <div className="flex flex-1 flex-col p-3">
      <nav className="flex flex-col gap-0.5" aria-label="Menú principal" onClick={onNavigate}>
        {items.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-200/80 dark:border-slate-700 pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
        >
          {icons.logout}
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const items = user ? MENU_BY_ROLE[user.role] : [];

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop: siempre visible desde lg */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white/95 dark:border-slate-700 dark:bg-slate-900/95">
        <SidebarNavContent />
      </aside>

      {/* Mobile: overlay cuando open */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" aria-modal="true" role="dialog" aria-label="Menú de navegación">
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-slate-200/80 bg-white shadow-xl z-50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/50">
            <div className="flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-slate-700 px-4">
              <span className="font-semibold text-slate-900 dark:text-white">Menú</span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Cerrar menú"
              >
                <IconClose className="h-6 w-6" />
              </button>
            </div>
            <SidebarNavContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
