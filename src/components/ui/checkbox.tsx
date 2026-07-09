import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const checkboxId = id ?? label.replace(/\s+/g, '-').toLowerCase();

  return (
    <label htmlFor={checkboxId} className={['inline-flex cursor-pointer items-center gap-2 text-sm text-ink', className].join(' ')}>
      <input
        id={checkboxId}
        type="checkbox"
        className="size-4 rounded border-[#cbd5e1] text-brand focus:ring-brand/30"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
