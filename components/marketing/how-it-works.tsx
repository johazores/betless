import { Card } from '@/components/ui/card';

const steps = [
  {
    title: 'Create your account',
    body: 'Sign up in under a minute. Your vaults and points are saved to your account.',
  },
  {
    title: 'Fund a savings vault',
    body: 'Deposit ₱10,000 or more and lock it for 12 to 60 months, in 12-month steps.',
  },
  {
    title: 'Earn points every month',
    body: 'After your first full month, you earn points monthly — about 4% of your deposit per year. 1 point = ₱1.',
  },
  {
    title: 'Redeem real rewards',
    body: 'Spend points on groceries, travel, apparel, gadgets, and partner merchant rewards. Your full deposit comes back at maturity.',
  },
];

export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
      {steps.map((step, index) => (
        <Card key={step.title}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-black text-white">
            {index + 1}
          </span>
          <p className="mt-4 text-lg font-black text-ink">{step.title}</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{step.body}</p>
        </Card>
      ))}
    </div>
  );
}
