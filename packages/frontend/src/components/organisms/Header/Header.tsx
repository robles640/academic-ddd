import { Link } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../../../stores';
import { IconMenu, IconBook, IconSun, IconMoon } from '../../../assets/icons';

type HeaderProps = {
  onMenuClick?: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-700 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/90">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-6">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Abrir menú"
            >
              <IconMenu className="h-6 w-6" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
              <IconBook className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sistema Académico
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {theme === 'dark' ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
          </button>
          {user && (
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              <span className="font-medium">{user.name}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
