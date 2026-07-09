'use client';

import type { HTMLAttributes, ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'warn' | 'info';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  title?: string;
  message: string;
  onClose?: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-green/30 bg-[#e8f8ef] text-green',
  error: 'border-red/30 bg-[#fff0ed] text-red',
  warn: 'border-[#f0c15a] bg-[#fff6dc] text-[#7a4e00]',
  info: 'border-brand/30 bg-[#eaf2ff] text-brand',
};

const roleByVariant: Record<ToastVariant, 'status' | 'alert'> = {
  success: 'status',
  error: 'alert',
  warn: 'status',
  info: 'status',
};

export function Toast({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
  ...props
}: ToastProps) {
  return (
    <div
      role={roleByVariant[variant]}
      className={[
        'pointer-events-auto flex w-full items-start justify-between gap-3 rounded-[7px] border px-3 py-2.5 text-sm shadow-[0_14px_34px_rgba(18,38,63,0.08)]',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      <div className="min-w-0">
        {title ? <p className="mb-0.5 font-bold text-ink">{title}</p> : null}
        <p className="text-current">{message}</p>
      </div>
      {onClose ? (
        <button
          type="button"
          aria-label="알림 닫기"
          className="shrink-0 rounded border border-line bg-white px-2 py-0.5 text-xs text-muted hover:bg-soft"
          onClick={onClose}
        >
          닫기
        </button>
      ) : null}
    </div>
  );
}

export interface ToastViewportProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ToastViewport({ children, className = '', ...props }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      className={[
        'pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
