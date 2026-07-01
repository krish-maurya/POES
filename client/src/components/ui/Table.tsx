import { type ReactNode } from 'react';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortKey?: keyof T | string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: keyof T | string) => void;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export function Table<T>({
  columns,
  data,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto scrollbar-thin rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-surface-raised">
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted',
                  col.sortable && 'cursor-pointer select-none hover:text-white',
                  col.className,
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? (
                      <MdArrowUpward className="h-3.5 w-3.5" />
                    ) : (
                      <MdArrowDownward className="h-3.5 w-3.5" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                'border-b border-border/50 transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-surface-hover',
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={cn('px-4 py-3 text-white', col.className)}>
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key as string] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
