import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, rowIndex: number) => ReactNode;
  className?: string;
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  caption?: string;
  emptyMessage?: string;
  scrollable?: boolean;
  maxHeight?: string;
  /** When set with `scrollable`, sizes the body to this many rows before scrolling. */
  visibleRows?: number;
  /** Row height used with `visibleRows` (default 2.5rem). Increase for larger table fonts. */
  rowHeightRem?: number;
  onRowClick?: (row: T, rowIndex: number) => void;
  getRowClassName?: (row: T, rowIndex: number) => string | undefined;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  emptyMessage = '데이터가 없습니다.',
  scrollable = false,
  maxHeight = '240px',
  visibleRows,
  rowHeightRem = 2.5,
  onRowClick,
  getRowClassName,
  className,
}: TableProps<T>) {
  const usesRowViewport = scrollable && visibleRows != null;
  const viewportHeight =
    visibleRows != null
      ? `calc(${rowHeightRem}rem * ${1 + visibleRows} + 4px)`
      : undefined;

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-line bg-panel',
        scrollable && 'overflow-y-auto overscroll-contain',
      )}
      style={
        usesRowViewport
          ? { maxHeight: viewportHeight }
          : scrollable
            ? { maxHeight }
            : undefined
      }
    >
      <table
        className={cn('w-full table-fixed border-collapse text-xs', className)}
      >
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'border-b border-[#e5eaf0] bg-[#f8fafc] px-2 py-2 text-left font-bold text-[#475569]',
                  scrollable && 'sticky top-0 z-10',
                  column.className ?? '',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-2 py-6 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={cn(
                  'border-b border-[#e5eaf0] last:border-b-0',
                  onRowClick && 'cursor-pointer hover:bg-[#f1f5f9]',
                  getRowClassName?.(row, rowIndex),
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'align-middle text-ink px-2 py-2',
                      column.className ?? '',
                    )}
                  >
                    {column.render ? column.render(row, rowIndex) : String(row[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
