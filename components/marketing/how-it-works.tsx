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
    icon: 'from-brand-400 to-brand-700 text-white shadow-[0_6px_20px_-6px_rgba(217,119,6,0.45)]',
    ring: 'ring-brand-100',
    pill: 'bg-brand-50 text-brand-800 border-brand-200/80',
  },
  success: {
    icon: 'from-success/80 to-success text-white shadow-[0_6px_20px_-6px_rgba(5,120,87,0.35)]',
    ring: 'ring-success/15',
    pill: 'bg-success-surface text-success border-success/20',
  },
  info: {
    icon: 'from-info/70 to-info text-white shadow-[0_6px_20px_-6px_rgba(29,78,216,0.35)]',
    ring: 'ring-info/15',
    pill: 'bg-info-surface text-info border-info/20',
  },
};

const steps: Step[] = [
  {
    title: 'Create your account',
    body: 'Sign up in under a minute. Your vaults and points are saved to your account.',
    accent: 'brand',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

function StepCard({ step, index, compact }: { step: Step; index: number; compact: boolean }) {
  const styles = accentStyles[step.accent];

  if (compact) {
    return (
      <Card
        padding="md"
        className="group h-full transition-all duration-200 hover:border-line-strong hover:shadow-card"
      >
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <span
              className={cn(
                'grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ring-4',
                styles.icon,
                styles.ring,
              )}
            >
              {step.icon}
            </span>
            <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-line bg-surface text-[10px] font-black text-ink">
              {index + 1}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', styles.pill)}>
              Step {index + 1}
            </span>
            <p className="mt-2 text-base font-black leading-snug text-ink">{step.title}</p>
            <p className="mt-1.5 text-sm leading-6 text-ink-muted">{step.body}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding="md"
      className="group relative h-full overflow-hidden transition-all duration-200 hover:border-line-strong hover:shadow-card"
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-90',
          step.accent === 'brand' && 'from-brand-300 to-brand-600',
          step.accent === 'success' && 'from-success/60 to-success',
          step.accent === 'info' && 'from-info/60 to-info',
        )}
      />

      <div className="flex flex-col">
        <div className="relative mx-auto w-fit">
          <span
            className={cn(
              'grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ring-4',
              styles.icon,
              styles.ring,
            )}
          >
            {step.icon}
          </span>
          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-line bg-surface text-[10px] font-black text-ink">
            {index + 1}
          </span>
        </div>

        <div className="mt-4 text-center">
          <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', styles.pill)}>
            Step {index + 1}
          </span>
          <p className="mt-2 text-base font-black leading-snug text-ink">{step.title}</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
        </div>
      </div>
    </Card>
  );
}

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ol className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title}>
            <StepCard step={step} index={index} compact />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {steps.map((step, index) => (
        <li key={step.title}>
          <StepCard step={step} index={index} compact={false} />
        </li>
      ))}
    </ol>
  );
}
