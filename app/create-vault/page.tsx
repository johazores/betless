import Link from 'next/link';
import type { Metadata } from 'next';
import { CreateVaultForm } from '@/components/vault/create-vault-form';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { formatPeso } from '@/lib/money';
import { DEFAULT_LOCK_PERCENT, REMITTANCE_MIN_LOCK_PHP } from '@/lib/vault-rules';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Create a lock pot',
  'Name your savings goal, lock a slice of incoming remittance on Stellar, and share verification with senders abroad.',
  '/create-vault',
);

const guidance = [
  ['1. Name your goal', 'College fund, tuition, emergency — so senders know what the lock is for.'],
  ['2. Set the split', `Default ${DEFAULT_LOCK_PERCENT}% of incoming remittance locks on Stellar; the rest stays spendable.`],
  ['3. Verify on-chain', 'Share the public link — anyone can confirm the lock on stellar.expert.'],
  ['4. Get 100% back', 'At maturity the network releases your full deposit automatically.'],
];

export default function CreateVaultPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Link href="/dashboard" className="text-sm font-bold text-brand-800 hover:text-brand-900">← Back to dashboard</Link>
            <div className="mt-6">
              <Badge>Create a lock pot</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">Lock it before you spend it.</h1>
              <p className="mt-5 text-lg leading-8 text-ink-muted">
                Name a goal, choose how much to lock (from remittance or a direct deposit), and confirm with a
                verification code. Minimum lock slice: {formatPeso(REMITTANCE_MIN_LOCK_PHP)}.
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
