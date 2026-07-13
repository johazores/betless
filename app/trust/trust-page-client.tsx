'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { apiRequest } from '@/lib/api-client';
import { formatDateTime } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import type { TransparencyView } from '@/types/transparency';

const reconciliationTone: Record<TransparencyView['reconciliation']['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  matched: 'success',
  pending: 'warning',
  mismatch: 'danger',
  unavailable: 'neutral',
};

const reconciliationLabel: Record<TransparencyView['reconciliation']['status'], string> = {
  matched: 'Matched',
  pending: 'Settling',
  mismatch: 'Review needed',
  unavailable: 'Unavailable',
};

export function TrustPageClient() {
  const [overview, setOverview] = useState<TransparencyView | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiRequest<TransparencyView>('/api/transparency');
        setOverview(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load transparency data.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <LoadingState label="Checking on-chain reserves…" />
        </div>
      </div>
    );
  }

  if (!overview || error) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <h1 className="text-2xl font-black text-ink">Verify reserves</h1>
            <p className="mt-2 text-sm text-ink-muted">{error || 'Transparency data is unavailable.'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const tone = reconciliationTone[overview.reconciliation.status];

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Badge tone="chain">Public verification</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">Verify our reserves</h1>
          <p className="mt-3 text-base leading-7 text-ink-muted">
            Every active Betless vault lock is held in a Stellar claimable balance with a time predicate.
            Anyone can compare our records against the public ledger — no account required.
          </p>
        </div>

        <Card padding="lg">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="chain">On-chain</Badge>
            <Badge tone={tone}>{reconciliationLabel[overview.reconciliation.status]}</Badge>
            <span className="text-xs font-semibold text-ink-muted">{overview.networkLabel}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink-muted">{overview.reconciliation.message}</p>
          <p className="mt-2 text-xs font-semibold text-ink-muted">
            Last checked {formatDateTime(overview.lastCheckedAt)}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">In Betless records</p>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-semibold text-ink-muted">Active vaults</dt>
                <dd className="text-lg font-black tabular-nums text-ink">{overview.db.activeVaults}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-semibold text-ink-muted">Locked principal</dt>
                <dd className="text-lg font-black tabular-nums text-ink">{formatPeso(overview.db.lockedPrincipal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-semibold text-ink-muted">Verified on-chain locks</dt>
                <dd className="text-lg font-black tabular-nums text-ink">{overview.db.verifiedLocks}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <p className="text-xs font-bold uppercase tracking-wide text-chain/80">On Stellar network</p>
            {overview.chain ? (
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm font-semibold text-ink-muted">Claimable balances</dt>
                  <dd className="text-lg font-black tabular-nums text-chain">{overview.chain.claimableBalances}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm font-semibold text-ink-muted">Locked principal</dt>
                  <dd className="text-lg font-black tabular-nums text-chain">{formatPeso(overview.chain.lockedPrincipal)}</dd>
                </div>
                {overview.assetCode ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm font-semibold text-ink-muted">Settlement asset</dt>
                    <dd className="text-sm font-black text-ink">{overview.assetCode}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                On-chain data is not available in this environment.
              </p>
            )}
          </Card>
        </div>

        {overview.enabled && overview.treasuryExplorerUrl ? (
          <Card>
            <h2 className="text-xl font-black text-ink">Audit independently</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Open the treasury account on stellar.expert to inspect every claimable balance, lock transaction,
              and release. Vault locks use native time predicates — the network enforces maturity, not our code.
            </p>
            <div className="mt-4 space-y-2">
              <p className="break-all font-mono text-xs text-ink-muted">Treasury: {overview.treasuryAccountId}</p>
              <a
                href={overview.treasuryExplorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-bold text-chain hover:underline"
              >
                View treasury on stellar.expert ↗
              </a>
            </div>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-xl font-black text-ink">How this works</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-ink-muted">
            <li>When you create a vault, your principal is locked in a Stellar claimable balance.</li>
            <li>The treasury can claim only after your maturity date; early withdrawal uses a separate ops signer.</li>
            <li>Points and rewards stay off-chain — only the deposit (the trust promise) is on-chain.</li>
            <li>This page compares active vault records against live claimable balances on the network.</li>
          </ol>
          <p className="mt-4 text-sm text-ink-muted">
            Signed in?{' '}
            <Link href="/dashboard" className="font-bold text-brand-800 hover:text-brand-900">
              Open your dashboard
            </Link>{' '}
            to see per-vault verification links.
          </p>
        </Card>
      </div>
    </div>
  );
}
