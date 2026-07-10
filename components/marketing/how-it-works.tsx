import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';
import { Card } from '@/components/ui/card';

type Step = {
  title: string;
  body: string;
  icon: ReactNode;
  accent: 'brand' | 'success' | 'info';
};

const accentStyles = {
  brand: {
    icon: 'from-brand-400 to-brand-700 text-white shadow-[0_8px_24px_-8px_rgba(217,119,6,0.55)]',
    ring: 'ring-brand-100',
    pill: 'bg-brand-50 text-brand-800 border-brand-200/80',
  },
  success: {
    icon: 'from-emerald-400 to-emerald-700 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.45)]',
    ring: 'ring-emerald-100',
    pill: 'bg-success-surface text-success border-success/20',
  },
  info: {
    icon: 'from-sky-400 to-blue-700 text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.45)]',
    ring: 'ring-info/20',
    pill: 'bg-info-surface text-info border-info/20',
  },
};

const steps: Step[] = [
  {
    title: 'Create your account',
    body: 'Sign up in under a minute. Your vaults and points are saved to your account.',
    accent: 'brand',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
    ),
  },
  {
    title: 'Fund a savings vault',
    body: 'Deposit ₱10,000 or more and lock it for 12 to 60 months, in 12-month steps.',
    accent: 'brand',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="M12 12v4" />
        <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Earn points every month',
    body: 'After your first full month, you earn points monthly — about 4% of your deposit per year. 1 point = ₱1.',
    accent: 'success',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 5-6" />
      </svg>
    ),
  },
  {
    title: 'Redeem real rewards',
    body: 'Spend points on groceries, travel, apparel, gadgets, and partner merchant rewards.',
    accent: 'info',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M12 8V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3" />
        <path d="M3 12h18" />
      </svg>
    ),
  },
  {
    title: 'Automatically receive your locked funds in full',
    body: 'When the lock period ends, your full deposit is returned to you automatically.',
    accent: 'success',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

function StepCard({ step, index, compact }: { step: Step; index: number; compact: boolean }) {
  const styles = accentStyles[step.accent];

  return (
    <Card
      padding={compact ? 'sm' : 'md'}
      className={cn(
        'group relative h-full overflow-hidden transition-all duration-300',
        'hover:-translate-y-1 hover:border-line-strong hover:shadow-soft',
        !compact && 'lg:pt-8',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 transition-opacity group-hover:opacity-100',
          step.accent === 'brand' && 'from-brand-300 to-brand-600',
          step.accent === 'success' && 'from-emerald-300 to-emerald-600',
          step.accent === 'info' && 'from-sky-300 to-blue-600',
        )}
      />

      <div className={cn('flex gap-4', compact ? 'items-start' : 'flex-col')}>
        <div className="relative shrink-0">
          <span
            className={cn(
              'grid place-items-center rounded-2xl bg-gradient-to-br ring-4 transition-transform duration-300 group-hover:scale-105',
              compact ? 'h-11 w-11' : 'h-14 w-14',
              styles.icon,
              styles.ring,
            )}
          >
            {step.icon}
          </span>
          <span
            className={cn(
              'absolute grid place-items-center rounded-full border bg-surface text-[10px] font-black tabular-nums text-ink shadow-sm',
              compact ? '-right-1.5 -top-1.5 h-5 w-5' : '-right-2 -top-2 h-6 w-6',
            )}
          >
            {index + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              'inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              styles.pill,
            )}
          >
            Step {index + 1}
          </span>
          <p className={cn('font-black text-ink', compact ? 'mt-2 text-base' : 'mt-3 text-lg leading-snug')}>
            {step.title}
          </p>
          <p className={cn('leading-6 text-ink-muted', compact ? 'mt-1.5 text-sm' : 'mt-2 text-sm')}>
            {step.body}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title}>
            <StepCard step={step} index={index} compact />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="relative">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 rounded-3xl bg-gradient-to-br from-brand-50/80 via-surface to-surface-muted/50 sm:-inset-x-8"
        aria-hidden
      />

      {/* Desktop connector line */}
      <div className="pointer-events-none absolute inset-x-0 top-[4.25rem] hidden lg:block" aria-hidden>
        <div className="mx-auto h-0.5 max-w-5xl bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />
      </div>

      <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
        {steps.map((step, index) => (
          <li key={step.title} className="relative">
            {index < steps.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-1.5 top-[4.25rem] hidden h-0.5 w-3 bg-brand-300/50 lg:block"
                aria-hidden
              />
            ) : null}
            <StepCard step={step} index={index} compact={false} />
          </li>
        ))}
      </ol>
    </div>
  );
}
