import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-sm" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
