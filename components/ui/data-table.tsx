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
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-muted">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row, index) => (
              <tr key={index} className="transition-colors hover:bg-surface-muted/60">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-pre-line px-4 py-3.5 align-top text-ink">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-ink-muted" colSpan={headers.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
