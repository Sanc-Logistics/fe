import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-xs text-[#475569]">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={[
          'min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink',
          'placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
          error ? 'border-red' : '',
          className,
        ].join(' ')}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red">{error}</p> : null}
    </div>
  );
}
