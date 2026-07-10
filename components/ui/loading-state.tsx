import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/class-names';

type LoadingStateProps = {
  label?: string;
  /** centered = page/section; table = data tables; compact = modals */
  variant?: 'centered' | 'table' | 'compact';
  className?: string;
};

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line bg-surface-muted/80 px-4 py-3.5">
        <div className="flex gap-6">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="divide-y divide-line/80">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-6 px-4 py-3.5">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="ml-auto h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingState({
  label = 'Loading…',
  variant = 'centered',
  className,
}: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div aria-busy="true" aria-live="polite" className={className}>
        <span className="sr-only">{label}</span>
        <TableSkeleton />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn('flex items-center justify-center gap-3 py-10', className)}
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size="md" />
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center py-16', className)}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="mt-4 text-sm font-medium text-ink-muted">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}
