import type { ButtonHTMLAttributes } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  direction?: SortDirection;
}

const directionLabel: Record<Exclude<SortDirection, null>, string> = {
  asc: '오름차순',
  desc: '내림차순',
};

const ariaSortValue = {
  asc: 'ascending',
  desc: 'descending',
} as const;

export function Sort({ label, direction = null, className = '', ...props }: SortProps) {
  const suffix = direction ? ` (${directionLabel[direction]})` : '';

  return (
    <button
      type="button"
      className={[
        'inline-flex items-center gap-1 rounded-[7px] border border-transparent px-1.5 py-1 text-xs font-bold text-[#475569] hover:border-line hover:bg-soft',
        direction ? 'text-brand' : '',
        className,
      ].join(' ')}
      aria-sort={direction ? ariaSortValue[direction] : 'none'}
      {...props}
    >
      <span>{label}</span>
      <span aria-hidden="true">{direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}</span>
      <span className="sr-only">{suffix}</span>
    </button>
  );
}
