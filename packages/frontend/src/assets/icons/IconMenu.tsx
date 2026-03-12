import type { SVGProps } from 'react';

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  const { className, ...rest } = props;
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden {...rest}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}
