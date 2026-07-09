import type { SelectHTMLAttributes } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: DropdownOption[];
  onChange?: (value: string) => void;
}

export function Dropdown({ label, options, id, className = '', onChange, ...props }: DropdownProps) {
  const selectId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="mb-1.5 block text-xs text-[#475569]">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={[
          'min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
          className,
        ].join(' ')}
        onChange={(event) => onChange?.(event.target.value)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
