import type { HTMLAttributes } from 'react';

export type ChipVariant = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'neutral';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const variantClasses: Record<ChipVariant, string> = {
  blue: 'bg-[#eaf2ff] text-brand',
  green: 'bg-[#e8f8ef] text-green',
  yellow: 'bg-[#fff5d6] text-[#8a6100]',
  red: 'bg-[#fff0ed] text-red',
  purple: 'bg-[#f2eafe] text-purple',
  neutral: 'bg-soft text-muted',
};

export function Chip({ variant = 'blue', className = '', children, ...props }: ChipProps) {
  return (
    <span
      className={[
        'inline-flex min-h-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
