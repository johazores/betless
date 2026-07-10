import { Skeleton } from '@/components/ui/skeleton';

export function LoadingState({ label = 'Loading Betless vault…' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
