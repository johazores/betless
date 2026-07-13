'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export function ReconciliationPanel({ overview }: { overview: TransparencyView }) {
  const tone = reconciliationTone[overview.reconciliation.status];

  return (
    <Card padding="lg" className="shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="chain">Reserve reconciliation</Badge>
            <Badge tone={tone}>{reconciliationLabel[overview.reconciliation.status]}</Badge>
          </div>
          <h3 className="mt-3 text-base font-semibold text-ink">Chain vs database</h3>
          <p className="mt-1 text-sm text-ink-muted">{overview.reconciliation.message}</p>
        </div>
        <Link href="/trust" target="_blank" className="shrink-0 text-sm font-bold text-chain hover:underline">
          Public page ↗
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface-muted px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">DB active vaults</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-ink">{overview.db.activeVaults}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-muted px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">DB locked principal</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-ink">{formatPeso(overview.db.lockedPrincipal)}</p>
        </div>
        <div className="rounded-xl border border-chain/20 bg-chain-surface px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-chain/80">On-chain balances</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-chain">
            {overview.chain?.claimableBalances ?? '—'}
          </p>
        </div>
        <div className="rounded-xl border border-chain/20 bg-chain-surface px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-chain/80">On-chain principal</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-chain">
            {overview.chain ? formatPeso(overview.chain.lockedPrincipal) : '—'}
          </p>
        </div>
      </div>

      {overview.treasuryExplorerUrl ? (
        <p className="mt-4">
          <a href={overview.treasuryExplorerUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-chain hover:underline">
            Treasury on stellar.expert ↗
          </a>
        </p>
      ) : null}
    </Card>
  );
}
