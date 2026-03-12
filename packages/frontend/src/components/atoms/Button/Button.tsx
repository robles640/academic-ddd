import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5
        text-sm font-semibold text-white
        bg-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-500/20
        transition-all duration-200
        hover:bg-indigo-500 hover:shadow-md hover:ring-indigo-500/30
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `.trim()}
      {...props}
    />
  );
}
