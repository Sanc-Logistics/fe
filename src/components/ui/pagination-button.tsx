import type { ButtonHTMLAttributes } from 'react';

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function PaginationButton({ active = false, className = '', children, ...props }: PaginationButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex min-h-8 min-w-8 items-center justify-center rounded-[7px] border px-2 text-sm font-medium',
        active
          ? 'border-brand bg-[#e9f1ff] text-brand'
          : 'border-line bg-white text-ink hover:border-[#9bbcff] hover:bg-soft',
        className,
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
