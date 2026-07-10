import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type StatProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  mono?: boolean;
  className?: string;
};

export function Stat({ label, value, hint, mono = false, className }: StatProps) {
  return (
    <div className={cn('rounded-lg border border-line bg-surface-muted/60 p-3', className)}>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={cn('mt-1 text-sm font-medium text-ink', mono && 'break-all font-mono text-xs')}>{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-ink-muted">{hint}</p> : null}
    </div>
  );
}
