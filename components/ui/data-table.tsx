import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';
import { EmptyState } from '@/components/ui/empty-state';

type DataTableProps = {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
  compact?: boolean;
};

export function DataTable({
  headers,
  rows,
  emptyMessage = 'No records',
  className,
  stickyHeader = true,
  compact = false,
}: DataTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        message="Try adjusting your filters or check back later."
        className={className}
      />
    );
  }

  const cellPadding = compact ? 'px-3 py-2.5' : 'px-4 py-3';
  const headerPadding = compact ? 'px-3 py-2.5' : 'px-4 py-3';

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-surface shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="border-b border-line bg-surface-muted/90 backdrop-blur-sm">
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className={cn(
                    headerPadding,
                    'text-left text-xs font-medium text-ink-muted',
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/80">
            {rows.map((row, index) => (
              <tr
                key={index}
                className="transition-colors duration-100 hover:bg-surface-muted/50 focus-within:bg-surface-muted/50"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={cn('whitespace-pre-line align-top text-ink', cellPadding)}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
