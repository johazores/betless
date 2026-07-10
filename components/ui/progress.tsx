import { cn } from '@/lib/class-names';

type ProgressProps = {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function Progress({ value, label, showValue = false, size = 'md' }: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, Math.round(value)));
  const hasHeader = Boolean(label) || showValue;

  return (
    <div>
      {hasHeader ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink-muted">
          {label ? <span>{label}</span> : <span />}
          {showValue ? <span className="tabular-nums text-ink">{safeValue}%</span> : null}
        </div>
      ) : null}
      <div
        className={cn('overflow-hidden rounded-full bg-surface-sunken', sizes[size])}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
