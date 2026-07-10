'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatPeso } from '@/lib/money';
import { getDisplayLabel } from '@/lib/display-labels';
import { cn } from '@/lib/class-names';
import type { OnChainOverviewView } from '@/types/notifications';
import { formatRelativeTime } from '@/lib/dates';

const statusTone: Record<OnChainOverviewView['status'], 'success' | 'warning' | 'neutral' | 'chain'> = {
  healthy: 'success',
  degraded: 'warning',
  offline: 'neutral',
  disabled: 'neutral',
};

export function OnChainPanel({ overview }: { overview: OnChainOverviewView }) {
  const tone = statusTone[overview.status];

  return (
    <Card padding="lg" className="overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="chain">On-chain</Badge>
            <Badge tone={tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'neutral'}>
              {overview.status === 'healthy' ? 'Operational' : overview.status === 'degraded' ? 'Needs attention' : overview.status === 'disabled' ? 'Off-chain mode' : 'Offline'}
            </Badge>
          </div>
          <h2 className="mt-3 text-2xl font-black text-ink">Network activity</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">{overview.statusMessage}</p>
          <p className="mt-1 text-xs font-semibold text-ink-muted">{overview.networkLabel}</p>
        </div>
        {overview.enabled ? (
          <dl className="grid grid-cols-2 gap-3 sm:text-right">
            <div className="rounded-xl border border-line bg-surface-muted px-3 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Verified locks</dt>
              <dd className="mt-0.5 text-lg font-black tabular-nums text-ink">{overview.confirmedLocks}</dd>
            </div>
            <div className="rounded-xl border border-chain/20 bg-chain-surface px-3 py-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-chain/80">On-chain value</dt>
              <dd className="mt-0.5 text-lg font-black tabular-nums text-chain">{formatPeso(overview.lockedOnChain)}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {overview.recentOperations.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-black text-ink">Recent transactions</h3>
          <ul className="mt-3 space-y-2">
            {overview.recentOperations.map((op) => (
              <li
                key={op.id}
                className="flex flex-col gap-2 rounded-xl border border-line bg-surface-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {getDisplayLabel(op.kind, 'stellarOperationKind')}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {op.vaultLabel} · {formatRelativeTime(op.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={op.state === 'CONFIRMED' ? 'success' : op.state === 'FAILED' ? 'danger' : 'warning'}>
                    {getDisplayLabel(op.state, 'stellarOperationState')}
                  </Badge>
                  {op.explorerUrl ? (
                    <a
                      href={op.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-chain hover:underline"
                    >
                      Explorer ↗
                    </a>
                  ) : (
                    <Link href={`/vaults/${op.vaultId}`} className="text-xs font-bold text-brand-700">
                      View vault
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : overview.enabled ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-surface-muted/50 px-4 py-6 text-center text-sm text-ink-muted">
          On-chain transactions will appear here when you create a vault.
        </p>
      ) : null}
    </Card>
  );
}
