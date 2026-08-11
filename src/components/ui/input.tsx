import type {
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
} from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DATE_LIKE_TYPES = new Set([
  'date',
  'time',
  'datetime-local',
  'month',
  'week',
]);

/** Calendar fields only — block typing so years cannot grow past 4 digits. */
const DATE_PICKER_ONLY_TYPES = new Set([
  'date',
  'datetime-local',
  'month',
  'week',
]);

function openDatePicker(input: HTMLInputElement) {
  try {
    input.showPicker?.();
  } catch {
    // showPicker can throw if the input is not user-activated.
  }
}

export function Input({
  label,
  error,
  id,
  className = '',
  type,
  onKeyDown,
  onPaste,
  onClick,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  // Chrome clips/overlaps year digits (e.g. "202020") when date inputs use large
  // fonts in narrow grid columns — keep date-like controls at a stable size.
  const isDateLike = typeof type === 'string' && DATE_LIKE_TYPES.has(type);
  const isDatePickerOnly =
    typeof type === 'string' && DATE_PICKER_ONLY_TYPES.has(type);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isDatePickerOnly) {
      return;
    }
    // Keep focus navigation; block digit/segment editing.
    // Do not use readOnly — Chrome hides the calendar icon when readOnly is set.
    if (event.key === 'Tab' || event.key === 'Escape') {
      return;
    }
    event.preventDefault();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (isDatePickerOnly) {
      event.preventDefault();
    }
    onPaste?.(event);
  };

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && isDatePickerOnly) {
      openDatePicker(event.currentTarget);
    }
  };

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-2xl font-bold text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        type={type}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleClick}
        className={[
          'min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-ink',
          isDateLike
            ? 'text-base [font-variant-ligatures:none] [font-variant-numeric:tabular-nums]'
            : 'text-lg',
          isDatePickerOnly ? 'cursor-pointer' : '',
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
