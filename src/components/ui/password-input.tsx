'use client';

import { useState } from 'react';

import { Input, type InputProps } from './input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

export function PasswordInput({ showToggle = true, label, error, id, className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-xs text-[#475569]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={[
            'min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 pr-16 text-sm text-ink',
            'placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
            error ? 'border-red' : '',
            className,
          ].join(' ')}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {showToggle ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-brand hover:bg-[#eaf2ff]"
            onClick={() => setVisible((current) => !current)}
            aria-pressed={visible}
          >
            {visible ? '숨기기' : '보기'}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-red">{error}</p> : null}
    </div>
  );
}
