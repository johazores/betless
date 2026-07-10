import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type KpiCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'brand' | 'danger';
  className?: string;
};

const toneStyles = {
  default: 'border-line bg-surface',
  brand: 'border-brand-200/60 bg-brand-50/40',
  danger: 'border-danger/15 bg-danger-surface/50',
};

export function KpiCard({ label, value, hint, tone = 'default', className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors duration-150',
        toneStyles[tone],
        className,
      )}
    >
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-ink-muted">{hint}</p> : null}
    </div>
  );
}
