import { Button } from '@/components/ui/button';
import { cn } from '@/lib/class-names';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      role="navigation"
      aria-label="Pagination"
    >
      <p className="text-sm text-ink-muted">
        <span className="tabular-nums">{start}–{end}</span>
        {' '}of{' '}
        <span className="font-medium tabular-nums text-ink">{total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-ink-muted">
          {page} / {totalPages}
        </span>
        <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
