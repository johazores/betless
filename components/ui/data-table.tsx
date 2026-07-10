import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type DataTableProps = {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
  className?: string;
};

export function DataTable({ headers, rows, emptyMessage = 'No records', className }: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-line', className)}>
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-muted text-left">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {rows.map((row, index) => (
            <tr key={index} className="transition-colors hover:bg-surface-muted/50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="whitespace-pre-line px-4 py-3 align-top text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-ink-muted" colSpan={headers.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
