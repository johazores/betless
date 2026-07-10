import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicLayout } from '@/components/layout/public-layout';
import { Progress } from '@/components/ui/progress';
import { Stat } from '@/components/ui/stat';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { formatPeso } from '@/lib/money';
import { rewardCatalog } from '@/lib/rewards';
import {
  ANNUAL_REWARD_RATE,
  FLAT_FEE_PRINCIPAL_LIMIT_PHP,
  FLAT_WITHDRAWAL_FEE_PHP,
  MIN_DEPOSIT_PHP,
  calculateMonthlyPoints,
} from '@/lib/vault-rules';

const exampleDeposit = 50_000;

const promises = [
  ['Your money comes back', 'When the lock period ends, 100% of your deposit is returned automatically. Every vault lock is independently verifiable on the Stellar network — not just a promise in our database.'],
  ['Clear rewards', `You earn about ${Math.round(ANNUAL_REWARD_RATE * 100)}% of your deposit per year as points. 1 point = ₱1. No tiers, no fine print.`],
  ['Transparent exit', `Need the money early? Withdraw any time for a flat ${formatPeso(FLAT_WITHDRAWAL_FEE_PHP)} fee (1% for vaults above ${formatPeso(FLAT_FEE_PRINCIPAL_LIMIT_PHP)}), always shown before you confirm.`],
];

export default function HomePage() {
  const monthlyPoints = calculateMonthlyPoints(exampleDeposit);

  return (
    <PublicLayout>
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge>Commitment savings</Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Lock your savings. Earn real rewards.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
              Betless helps you commit to long-term savings. Deposit {formatPeso(MIN_DEPOSIT_PHP)} or more,
              lock it for 12 months or longer, and earn points every month that you can spend on groceries,
              travel, gadgets, and more. Your full deposit comes back at the end.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-vault"><Button className="w-full sm:w-auto">Start saving</Button></Link>
              <a href="#how-it-works"><Button variant="secondary" className="w-full sm:w-auto">How it works</Button></a>
            </div>
          </div>

          <Card>
            <p className="text-sm font-black text-brand-700">Example vault</p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-ink-muted">Locked deposit</p>
                <p className="mt-1 text-4xl font-black text-ink">{formatPeso(exampleDeposit)}</p>
              </div>
              <Progress value={40} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Lock period" value={<span className="text-2xl">12 months</span>} />
                <Stat label="Points per month" value={<span className="text-2xl">{monthlyPoints.toLocaleString('en-PH')}</span>} />
              </div>
              <p className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold leading-6 text-brand-900">
                {formatPeso(exampleDeposit)} locked for 12 months earns about {(monthlyPoints * 12).toLocaleString('en-PH')} points —
                and the full {formatPeso(exampleDeposit)} is returned at maturity.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8" id="how-it-works">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 max-w-2xl">
            <Badge>How it works</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink">Five simple steps.</h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">Everything Betless does, in plain language.</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {promises.map(([title, body]) => (
            <Card key={title}>
              <h2 className="text-xl font-black tracking-tight text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 max-w-2xl">
            <Badge>Rewards</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink">Points you can actually use.</h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted">1 point = ₱1, redeemable for real-world rewards from partner merchants.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rewardCatalog.slice(0, 4).map((reward) => (
              <div key={reward.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{reward.category}</p>
                <p className="mt-2 font-black text-ink">{reward.name}</p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{reward.points.toLocaleString('en-PH')} points</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-line bg-surface p-8 shadow-card sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-brand-700">Start today</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-ink">Open your first vault in minutes.</h2>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              Create an account, deposit {formatPeso(MIN_DEPOSIT_PHP)} or more, choose a lock period, and start earning points after your first full month.
            </p>
            <Link href="/create-vault" className="mt-7 inline-flex"><Button>Create a vault</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
