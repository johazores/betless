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
    title: 'Money arrives',
    body: 'Remittance lands via GCash, InstaPay, or a Stellar anchor — familiar rails, no crypto vocabulary.',
    accent: 'brand',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Auto-lock a slice',
    body: 'Choose a goal name and lock percentage. The rest stays spendable — the locked portion becomes a Stellar claimable balance.',
    accent: 'brand',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'Sender verifies',
    body: 'Share a public link — senders abroad confirm the lock on stellar.expert without a Betless account.',
    accent: 'info',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: '100% back at maturity',
    body: 'The network enforces the time lock. When the period ends, your full deposit returns automatically.',
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
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title}>
          <StepCard step={step} index={index} compact={false} />
        </li>
      ))}
    </ol>
  );
}
