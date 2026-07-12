import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { createMetadata } from '@/lib/seo';
import { getVaultStatusLabel } from '@/lib/status-labels';
import { VaultService } from '@/services/vault-service';

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const verification = await VaultService.getPublicVerification(token);

  if (!verification) {
    return createMetadata({
      title: 'Vault not found',
      description: 'This verification link is invalid or has expired.',
      path: `/verify/${token}`,
    });
  }

  const label = verification.goalName ?? 'Savings vault';

  return createMetadata({
    title: `${label} — verified lock`,
    description: `${formatPeso(verification.principal)} locked on Stellar until ${formatShortDate(verification.maturesAt)}.`,
    path: `/verify/${token}`,
  });
}

export default async function VerifyVaultPage({ params }: PageProps) {
  const { token } = await params;
  const verification = await VaultService.getPublicVerification(token);

  if (!verification) {
    notFound();
  }

  const title = verification.goalName ?? 'Savings vault';

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <Badge>Public verification</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Anyone with this link can confirm the lock status independently — no Betless account required.
            </p>
          </div>

          <Card>
            <dl className="divide-y divide-line">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-semibold text-ink-muted">Locked amount</dt>
                <dd className="text-lg font-black text-ink">{formatPeso(verification.principal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-semibold text-ink-muted">Status</dt>
                <dd className="text-sm font-black text-ink">{getVaultStatusLabel(verification.status)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-semibold text-ink-muted">Lock period</dt>
                <dd className="text-sm font-black text-ink">{verification.lockMonths} months</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm font-semibold text-ink-muted">Matures on</dt>
                <dd className="text-sm font-black text-ink">{formatShortDate(verification.maturesAt)}</dd>
              </div>
              {verification.sourceAmount != null && verification.lockPercent != null ? (
                <>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm font-semibold text-ink-muted">From incoming payment</dt>
                    <dd className="text-sm font-black text-ink">{formatPeso(verification.sourceAmount)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm font-semibold text-ink-muted">Auto-locked</dt>
                    <dd className="text-sm font-black text-ink">
                      {verification.lockPercent}% ({formatPeso(verification.principal)})
                    </dd>
                  </div>
                  {verification.spendableAmount != null ? (
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-sm font-semibold text-ink-muted">Spendable immediately</dt>
                      <dd className="text-sm font-black text-ink">{formatPeso(verification.spendableAmount)}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          </Card>

          {verification.stellar ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black text-ink">On-chain verification</h2>
                <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-black text-ink">
                  {verification.stellar.status === 'LOCKED' ? 'Lock verified' : verification.stellar.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {verification.stellar.status === 'LOCKED'
                  ? 'This deposit sits in a Stellar claimable balance that the network will not release before the maturity date.'
                  : 'On-chain lock status for this vault.'}
              </p>

              {verification.stellar.claimableBalanceId ? (
                <p className="mt-4 break-all rounded-2xl border border-line bg-surface-muted p-4 font-mono text-xs text-ink-muted">
                  {verification.stellar.claimableBalanceId}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
                {verification.stellar.lockExplorerUrl ? (
                  <a
                    href={verification.stellar.lockExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-800 hover:text-brand-900"
                  >
                    View lock transaction ↗
                  </a>
                ) : null}
                {verification.stellar.releaseExplorerUrl ? (
                  <a
                    href={verification.stellar.releaseExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-800 hover:text-brand-900"
                  >
                    View release transaction ↗
                  </a>
                ) : null}
              </div>
            </Card>
          ) : null}

          <p className="text-center text-sm text-ink-muted">
            <Link href="/reserves" className="font-bold text-brand-800 hover:text-brand-900">
              View all locked reserves ↗
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
