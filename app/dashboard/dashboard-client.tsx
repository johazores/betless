'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { VaultCard } from '@/components/vault/vault-card';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { ReferralCard } from '@/components/referral/referral-card';
import { apiRequest } from '@/lib/api-client';
import { formatDateTime } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import type { PointsTransactionView, SummaryView, VaultView } from '@/types/vault';

function MetricCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <Card>
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
      {helper ? <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">{helper}</p> : null}
    </Card>
  );
}

export function DashboardClient() {
  const [vaults, setVaults] = useState<VaultView[]>([]);
  const [summary, setSummary] = useState<SummaryView | null>(null);
  const [transactions, setTransactions] = useState<PointsTransactionView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // Sync vaults once via /api/vaults, then read summary + history without duplicate sync work.
      const loadedVaults = await apiRequest<VaultView[]>('/api/vaults');
      const [loadedSummary, loadedTransactions] = await Promise.all([
        apiRequest<SummaryView>('/api/summary'),
        apiRequest<PointsTransactionView[]>('/api/points?skipSync=1'),
      ]);
      setVaults(loadedVaults);
      setSummary(loadedSummary);
      setTransactions(loadedTransactions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Dashboard could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><LoadingState label="Loading your dashboard…" /></div></section></PublicLayout>;
  }

  if (error) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><EmptyState title="Dashboard could not be loaded" message={error} /></div></section></PublicLayout>;
  }

  const activeVaults = vaults.filter((vault) => vault.status === 'ACTIVE');
  const totalPointsEarned = transactions
    .filter((transaction) => transaction.type === 'MONTHLY_REWARD')
    .reduce((sum, transaction) => sum + transaction.points, 0);
  const recentTransactions = transactions.slice(0, 6);

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge>Your savings</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-ink">Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
                Track your locked savings, points, and upcoming maturity dates.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/rewards"><Button variant="secondary">Redeem rewards</Button></Link>
              <Link href="/create-vault"><Button>New vault</Button></Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Locked balance"
              value={formatPeso(summary?.lockedBalance ?? 0)}
              helper={`${activeVaults.length} active ${activeVaults.length === 1 ? 'vault' : 'vaults'}`}
            />
            <MetricCard
              label="Available points"
              value={(summary?.availablePoints ?? 0).toLocaleString('en-PH')}
              helper="1 point = ₱1 in rewards"
            />
            <MetricCard
              label="Points earned to date"
              value={totalPointsEarned.toLocaleString('en-PH')}
              helper="Monthly rewards across all vaults"
            />
          </div>

          <ReferralCard variant="compact" onChanged={() => void loadDashboard()} />

          {vaults.length === 0 ? (
            <div className="space-y-8">
              <Card>
                <h2 className="text-2xl font-black text-ink">Open your first vault</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Lock a deposit, earn points every month, and get the full amount back at maturity.
                </p>
                <Link href="/create-vault" className="mt-5 inline-flex"><Button>Create a vault</Button></Link>
              </Card>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-700">How it works</p>
                  <h3 className="mt-1 text-xl font-black text-ink">Five steps to start saving</h3>
                </div>
                <HowItWorks compact />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {vaults.map((vault) => (
                <VaultCard key={vault.id} vault={vault} />
              ))}
            </div>
          )}

          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-ink">Points activity</h2>
                <p className="mt-1 text-sm leading-6 text-ink-muted">Monthly rewards and redemptions.</p>
              </div>
              <Link href="/rewards" className="text-sm font-black text-brand-800 hover:text-brand-900">Full history →</Link>
            </div>
            <div className="mt-5 space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface-muted p-4 text-sm font-semibold text-ink-muted">
                  No points yet. Points start after your first full month of an active vault.
                </p>
              ) : recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted p-4">
                  <div>
                    <p className="font-black text-ink">{transaction.description}</p>
                    <p className="mt-1 text-sm font-semibold text-ink-muted">{formatDateTime(transaction.createdAt)}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-black tabular-nums ${transaction.points >= 0 ? 'text-success' : 'text-danger'}`}>
                    {transaction.points >= 0 ? '+' : ''}{transaction.points.toLocaleString('en-PH')} pts
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
