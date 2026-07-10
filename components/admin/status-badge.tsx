import { cn } from '@/lib/class-names';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-success-surface text-success border-success/20',
  SUSPENDED: 'bg-danger-surface text-danger border-danger/20',
  CLOSED: 'bg-surface-sunken text-ink-muted border-line',
  VERIFIED: 'bg-success-surface text-success border-success/20',
  PENDING: 'bg-brand-50 text-brand-800 border-brand-200',
  REJECTED: 'bg-danger-surface text-danger border-danger/20',
  CONFIRMED: 'bg-success-surface text-success border-success/20',
  FAILED: 'bg-danger-surface text-danger border-danger/20',
  PENDING_VERIFICATION: 'bg-brand-50 text-brand-800 border-brand-200',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const style = statusStyles[normalized] ?? 'bg-surface-sunken text-ink-muted border-line';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        style,
        className,
      )}
    >
      {status.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
}
