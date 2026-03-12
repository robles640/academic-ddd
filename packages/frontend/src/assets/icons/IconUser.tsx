import type { SVGProps } from 'react';

export function IconUser({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998-0.059A7.5 7.5 0 0 1 4.5 20.118Z" />
    </svg>
  );
}
