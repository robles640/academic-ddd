import { create } from 'zustand';

const STORAGE_KEY = 'academic_theme';

export type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const stored = getStoredTheme();
applyTheme(stored);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme);
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      }
      return { theme: next };
    });
  },
}));
