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
    <div className={cn('rounded-xl border border-line bg-surface-muted p-4', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      <p className={cn('mt-1 font-semibold text-ink', mono && 'break-all font-mono text-sm')}>{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-ink-muted">{hint}</p> : null}
    </div>
  );
}
