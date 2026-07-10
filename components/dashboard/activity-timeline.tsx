'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/dates';
import { getDisplayLabel } from '@/lib/display-labels';
import type { OnChainActivityItem } from '@/types/notifications';
import type { PointsTransactionView } from '@/types/vault';

type TimelineItem =
  | { kind: 'points'; id: string; at: string; title: string; subtitle: string; delta: number }
  | { kind: 'chain'; id: string; at: string; title: string; subtitle: string; state: OnChainActivityItem['state']; href?: string };

function buildTimeline(
  transactions: PointsTransactionView[],
  operations: OnChainActivityItem[],
  limit = 8,
): TimelineItem[] {
  const pointsItems: TimelineItem[] = transactions.slice(0, limit).map((tx) => ({
    kind: 'points',
    id: `pts-${tx.id}`,
    at: tx.createdAt,
    title: tx.description,
    subtitle: 'Points activity',
    delta: tx.points,
  }));

  const chainItems: TimelineItem[] = operations.map((op) => ({
    kind: 'chain',
    id: `chain-${op.id}`,
    at: op.createdAt,
    title: getDisplayLabel(op.kind, 'stellarOperationKind'),
    subtitle: op.vaultLabel,
    state: op.state,
    href: op.explorerUrl ?? `/vaults/${op.vaultId}`,
  }));

  return [...pointsItems, ...chainItems]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

export function ActivityTimeline({
  transactions,
  operations,
}: {
  transactions: PointsTransactionView[];
  operations: OnChainActivityItem[];
}) {
  const items = buildTimeline(transactions, operations);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-ink">Recent activity</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            Points, vault events, and on-chain transactions in one timeline.
          </p>
        </div>
        <Link href="/notifications" className="text-sm font-black text-brand-800 hover:text-brand-900">
          All updates →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-line bg-surface-muted/50 px-4 py-8 text-center text-sm text-ink-muted">
          Activity will show up here as you create vaults and earn points.
        </p>
      ) : (
        <ol className="relative mt-6 space-y-0 border-l border-line pl-6">
          {items.map((item, index) => (
            <li key={item.id} className="relative pb-6 last:pb-0">
              <span
                className={`absolute -left-[calc(0.75rem+1px)] top-1.5 grid h-3 w-3 place-items-center rounded-full ring-4 ring-surface ${
                  item.kind === 'chain' ? 'bg-chain' : item.delta >= 0 ? 'bg-success' : 'bg-danger'
                }`}
                aria-hidden
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <Badge tone={item.kind === 'chain' ? 'chain' : 'neutral'}>
                      {item.kind === 'chain' ? 'On-chain' : 'Points'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted" title={new Date(item.at).toLocaleString()}>
                    {item.subtitle} · {formatRelativeTime(item.at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.kind === 'points' ? (
                    <p className={`text-sm font-black tabular-nums ${item.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                      {item.delta >= 0 ? '+' : ''}
                      {item.delta.toLocaleString('en-PH')} pts
                    </p>
                  ) : (
                    <>
                      <Badge
                        tone={
                          item.state === 'CONFIRMED' ? 'success' : item.state === 'FAILED' ? 'danger' : 'warning'
                        }
                      >
                        {getDisplayLabel(item.state, 'stellarOperationState')}
                      </Badge>
                      {item.href?.startsWith('http') ? (
                        <a href={item.href} target="_blank" rel="noreferrer" className="text-xs font-bold text-chain hover:underline">
                          Explorer ↗
                        </a>
                      ) : item.href ? (
                        <Link href={item.href} className="text-xs font-bold text-brand-700">
                          View vault
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
              {index < items.length - 1 ? null : null}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
