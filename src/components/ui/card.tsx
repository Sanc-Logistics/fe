import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'elevated' | 'panel';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: CardVariant;
  children?: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  elevated: 'rounded-xl border border-line bg-panel shadow-[0_14px_34px_rgba(18,38,63,0.08)]',
  panel: 'rounded-lg border border-line bg-panel',
};

export function Card({
  title,
  description,
  variant = 'elevated',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div className={[variantClasses[variant], 'overflow-hidden', className].join(' ')} {...props}>
      {title || description ? (
        <div className="border-b border-line bg-[#fbfcfe] px-4 py-3">
          {title ? <h2 className="text-lg font-semibold text-ink">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </div>
  );
}
