import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'brand' | 'neutral' | 'success' | 'info' | 'danger';
};

const tones = {
  brand: 'border-brand-200/80 bg-brand-50 text-brand-800',
  neutral: 'border-line bg-surface-sunken text-ink-muted',
  success: 'border-success/20 bg-success-surface text-success',
  info: 'border-info/20 bg-info-surface text-info',
  danger: 'border-danger/20 bg-danger-surface text-danger',
};

export function Badge({ tone = 'brand', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
