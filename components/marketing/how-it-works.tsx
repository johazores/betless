import { Card } from '@/components/ui/card';

const steps = [
  {
    title: 'Create a wallet',
    body: 'We generate a free Stellar wallet right in your browser, or you can paste your own. This becomes your vault address.',
  },
  {
    title: 'Set your savings goal',
    body: 'Pick a peso target, how often you will add money, and a lock period. The peso amounts are your savings plan.',
  },
  {
    title: 'We activate it on Stellar',
    body: 'Betless activates your wallet on the Stellar test network and saves a receipt you can verify on a public explorer.',
  },
  {
    title: 'Follow the plan & claim rewards',
    body: 'Mark each top-up as you save, claim fixed milestone rewards, then unlock when you reach your goal or the date.',
  },
];

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-4">
      <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
        {steps.map((step, index) => (
          <Card key={step.title}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">
              {index + 1}
            </span>
            <p className="mt-4 text-lg font-black text-slate-950">{step.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
          </Card>
        ))}
      </div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">
        No real money is used. Betless runs on the Stellar test network, and your peso amounts are a savings plan tracked by the app. You keep your wallet recovery key — Betless only ever stores your public address.
      </p>
    </div>
  );
}
