import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'brand' | 'neutral' | 'success' | 'info' | 'danger';
};

const tones = {
  brand: 'border-brand-200 bg-brand-50 text-brand-800',
  neutral: 'border-line-strong bg-surface-sunken text-ink-muted',
  success: 'border-success/20 bg-success-surface text-success',
  info: 'border-info/20 bg-info-surface text-info',
  danger: 'border-danger/20 bg-danger-surface text-danger',
};

export function Badge({ tone = 'brand', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
