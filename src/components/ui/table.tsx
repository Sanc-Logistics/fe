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
  onRowClick?: (row: T, rowIndex: number) => void;
  getRowClassName?: (row: T, rowIndex: number) => string | undefined;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  emptyMessage = '데이터가 없습니다.',
  scrollable = false,
  maxHeight = '240px',
  visibleRows,
  onRowClick,
  getRowClassName,
}: TableProps<T>) {
  const usesRowViewport = scrollable && visibleRows != null;
  const shouldScroll = usesRowViewport && data.length > visibleRows;
  const rowHeightRem = 2.5;
  const viewportHeight =
    visibleRows != null
      ? `calc(${rowHeightRem}rem * ${1 + visibleRows} + 4px)`
      : undefined;

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-line bg-panel',
        usesRowViewport && 'overflow-y-auto overscroll-contain',
        usesRowViewport && !shouldScroll && 'overflow-y-hidden',
      )}
      style={
        usesRowViewport
          ? { height: viewportHeight, minHeight: viewportHeight, maxHeight: viewportHeight }
          : scrollable
            ? { maxHeight }
            : undefined
      }
    >
      <table className="w-full table-fixed border-collapse text-xs">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className={usesRowViewport ? 'h-10' : undefined}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'border-b border-[#e5eaf0] bg-[#f8fafc] px-2 py-2 text-left font-bold text-[#475569]',
                  usesRowViewport && 'sticky top-0 z-10 h-10',
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
                  usesRowViewport && 'h-10 overflow-hidden',
                  onRowClick && 'cursor-pointer hover:bg-[#f1f5f9]',
                  getRowClassName?.(row, rowIndex),
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'align-middle text-ink',
                      usesRowViewport ? 'px-2 py-1' : 'px-2 py-2',
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
