import Link from 'next/link';
import type { Metadata } from 'next';
import { CreateVaultForm } from '@/components/vault/create-vault-form';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { formatPeso } from '@/lib/money';
import { ANNUAL_REWARD_RATE, MIN_DEPOSIT_PHP } from '@/lib/vault-rules';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Create a vault',
  'Lock a deposit, choose your commitment period, and start earning monthly points on Betless.',
  '/create-vault',
);

const guidance = [
  ['1. Deposit', `Lock ${formatPeso(MIN_DEPOSIT_PHP)} or more. Your money is held with licensed custodial partners.`],
  ['2. Earn points monthly', `About ${Math.round(ANNUAL_REWARD_RATE * 100)}% of your deposit per year, starting after your first full month.`],
  ['3. Redeem rewards', 'Spend points on groceries, travel, apparel, gadgets, and partner merchant rewards.'],
  ['4. Get your money back', 'At the end of the lock period, your full deposit is returned automatically.'],
];

export default function CreateVaultPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Link href="/dashboard" className="text-sm font-bold text-brand-800 hover:text-brand-900">← Back to dashboard</Link>
            <div className="mt-6">
              <Badge>Create a vault</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">Commit to your savings.</h1>
              <p className="mt-5 text-lg leading-8 text-ink-muted">
                Choose an amount and a lock period, pay with your favorite cash-in method, and confirm with a
                verification code. You&apos;ll see exactly what you earn before any money moves.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {guidance.map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                  <p className="text-sm font-black text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <CreateVaultForm />
        </div>
      </section>
    </PublicLayout>
  );
}
