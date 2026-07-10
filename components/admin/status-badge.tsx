import { getDisplayLabel } from '@/lib/display-labels';
import { cn } from '@/lib/class-names';

type StatusBadgeProps = {
  status: string;
  context?: 'userStatus' | 'verificationStatus' | 'vaultStatus' | 'stellarOperationState' | 'generic';
  className?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-success-surface text-success border-success/20',
  SUSPENDED: 'bg-danger-surface text-danger border-danger/20',
  CLOSED: 'bg-surface-sunken text-ink-muted border-line',
  VERIFIED: 'bg-success-surface text-success border-success/20',
  UNVERIFIED: 'bg-surface-sunken text-ink-muted border-line',
  PENDING: 'bg-brand-50 text-brand-800 border-brand-200',
  REJECTED: 'bg-danger-surface text-danger border-danger/20',
  CONFIRMED: 'bg-success-surface text-success border-success/20',
  FAILED: 'bg-danger-surface text-danger border-danger/20',
  MATURED: 'bg-info-surface text-info border-info/20',
  WITHDRAWN_EARLY: 'bg-surface-sunken text-ink-muted border-line',
  LOCK: 'bg-brand-50 text-brand-800 border-brand-200',
  CLAIM: 'bg-success-surface text-success border-success/20',
  EARLY_WITHDRAW: 'bg-surface-sunken text-ink-muted border-line',
};

export function StatusBadge({ status, context = 'generic', className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  const style = statusStyles[normalized] ?? 'bg-surface-sunken text-ink-muted border-line';
  const labelContext =
    context === 'generic'
      ? (['ACTIVE', 'SUSPENDED', 'CLOSED'].includes(normalized)
          ? 'userStatus'
          : ['VERIFIED', 'UNVERIFIED', 'PENDING', 'REJECTED'].includes(normalized)
            ? 'verificationStatus'
            : ['MATURED', 'WITHDRAWN_EARLY'].includes(normalized)
              ? 'vaultStatus'
              : ['PENDING', 'CONFIRMED', 'FAILED'].includes(normalized)
                ? 'stellarOperationState'
                : 'generic')
      : context;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {getDisplayLabel(status, labelContext)}
    </span>
  );
}
