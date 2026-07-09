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
    <nav aria-label="Vault creation progress" className="rounded-3xl border border-orange-100 bg-white p-3 shadow-card">
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <li key={step.title}>
              <div
                className={cn(
                  'flex h-full gap-3 rounded-2xl border p-3 transition',
                  isActive && 'border-slate-950 bg-slate-950 text-white shadow-soft',
                  isDone && 'border-emerald-200 bg-emerald-50 text-emerald-950',
                  !isActive && !isDone && 'border-orange-100 bg-orange-50 text-slate-800',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black',
                    isActive && 'bg-white text-slate-950',
                    isDone && 'bg-emerald-600 text-white',
                    !isActive && !isDone && 'bg-white text-orange-900',
                  )}
                >
                  {isDone ? '✓' : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-black">{step.title}</span>
                  <span className={cn('mt-1 block text-xs leading-5', isActive ? 'text-slate-200' : 'text-slate-600')}>
                    {step.description}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
