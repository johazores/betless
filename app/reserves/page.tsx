import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { createMetadata } from '@/lib/seo';
import { ReservesService } from '@/services/reserves-service';

export const metadata: Metadata = createMetadata({
  title: 'Proof of reserves',
  description: 'Public overview of all active Betless vault locks — independently verifiable on the Stellar network.',
  path: '/reserves',
});

export default async function ReservesPage() {
  const reserves = await ReservesService.getPublicOverview();

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <Badge>Proof of reserves</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              Every lock, publicly verifiable.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
              Betless vault principals are held in Stellar claimable balances with time predicates. This page
              aggregates all active locks — no login required.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Total locked', formatPeso(reserves.totalLocked)],
              ['Active vaults', reserves.activeVaultCount.toLocaleString('en-PH')],
              ['On-chain confirmed', reserves.onChainConfirmedCount.toLocaleString('en-PH')],
              ['On-chain total', formatPeso(reserves.onChainLockedTotal)],
            ].map(([label, value]) => (
              <Card key={label} padding="md">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
                <p className="mt-2 text-xl font-black text-ink">{value}</p>
              </Card>
            ))}
          </div>

          {reserves.stellarEnabled ? (
            <Card padding="md">
              <p className="text-sm font-black text-ink">Network: {reserves.networkLabel}</p>
              {reserves.treasuryExplorerUrl ? (
                <a
                  href={reserves.treasuryExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-bold text-brand-800 hover:text-brand-900"
                >
                  View treasury account on stellar.expert ↗
                </a>
              ) : null}
            </Card>
          ) : (
            <Card padding="md">
              <p className="text-sm text-ink-muted">
                On-chain verification is not active in this environment. Vault totals below reflect the application ledger.
              </p>
            </Card>
          )}

          <div>
            <h2 className="text-xl font-black text-ink">Active locks</h2>
            {reserves.vaults.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No active vaults yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reserves.vaults.map((vault) => (
                  <li key={vault.verifyPath}>
                    <Card padding="md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-ink">{vault.goalName ?? 'Savings vault'}</p>
                          <p className="mt-1 text-sm text-ink-muted">
                            {formatPeso(vault.principal)} · matures {formatShortDate(vault.maturesAt)}
                            {vault.stellarStatus === 'LOCKED' ? ' · Lock verified' : ''}
                          </p>
                        </div>
                        <Link href={vault.verifyPath} className="text-sm font-bold text-brand-800 hover:text-brand-900">
                          Verify ↗
                        </Link>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-center text-sm text-ink-muted">
            <Link href="/" className="font-bold text-brand-800 hover:text-brand-900">
              ← Back to Betless
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
