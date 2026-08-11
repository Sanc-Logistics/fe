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
        <label htmlFor={selectId} className="mb-1.5 block text-2xl font-bold text-ink">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={[
          'min-h-9 w-full appearance-none rounded-[7px] border border-[#cbd5e1] bg-white bg-[length:1rem] bg-[position:right_0.5rem_center] bg-no-repeat px-2.5 py-2 pr-8 text-lg text-ink',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23334155\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")]',
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
