import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  caption?: string;
  emptyMessage?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  caption,
  emptyMessage = '데이터가 없습니다.',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-panel">
      <table className="w-full table-fixed border-collapse text-xs">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  'border-b border-[#e5eaf0] bg-[#f8fafc] px-2 py-2 text-left font-bold text-[#475569]',
                  column.className ?? '',
                ].join(' ')}
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
              <tr key={rowIndex} className="border-b border-[#e5eaf0] last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className={['px-2 py-2 align-middle text-ink', column.className ?? ''].join(' ')}>
                    {column.render ? column.render(row) : String(row[column.key] ?? '')}
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
