import type { InputHTMLAttributes } from 'react';

const baseClass =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/50 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:ring-slate-600/50 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/30';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`${baseClass} ${className}`.trim()}
      {...props}
    />
  );
}
