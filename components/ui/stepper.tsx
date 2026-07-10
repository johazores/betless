import { cn } from '@/lib/class-names';

export type StepperStep = {
  title: string;
  description: string;
};

type StepperProps = {
  steps: StepperStep[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Vault creation progress" className="rounded-2xl border border-line bg-surface p-3 shadow-card">
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <li key={step.title}>
              <div
                className={cn(
                  'flex h-full gap-3 rounded-xl border p-3 transition-colors',
                  isActive && 'border-brand-500 bg-brand-50 text-ink',
                  isDone && 'border-success/30 bg-success-surface text-ink',
                  !isActive && !isDone && 'border-line bg-surface-muted text-ink-muted',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                    isActive && 'border-brand-500 bg-surface text-brand-800',
                    isDone && 'border-success bg-success text-white',
                    !isActive && !isDone && 'border-line-strong bg-surface text-ink-muted',
                  )}
                >
                  {isDone ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink-muted">{step.description}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
