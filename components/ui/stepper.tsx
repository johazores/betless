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
    <nav aria-label="Vault creation progress" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <li key={step.title}>
              <div
                className={cn(
                  'flex h-full gap-3 rounded-xl border p-3 transition',
                  isActive && 'border-amber-500 bg-amber-50 text-slate-950',
                  isDone && 'border-emerald-300 bg-emerald-50 text-slate-950',
                  !isActive && !isDone && 'border-slate-200 bg-slate-50 text-slate-700',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-black',
                    isActive && 'border-amber-500 bg-white text-amber-800',
                    isDone && 'border-emerald-600 bg-emerald-600 text-white',
                    !isActive && !isDone && 'border-slate-300 bg-white text-slate-600',
                  )}
                >
                  {isDone ? '✓' : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-black">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{step.description}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
