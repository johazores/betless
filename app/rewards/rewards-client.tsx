'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ReferralCard } from '@/components/referral/referral-card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { apiRequest, postJson } from '@/lib/api-client';
import { formatDateTime } from '@/lib/dates';
import { rewardCatalog } from '@/lib/rewards';
import { refreshSummary } from '@/lib/summary-events';
import type { PointsTransactionView, RedemptionResult, SummaryView } from '@/types/vault';

export function RewardsClient() {
  const [summary, setSummary] = useState<SummaryView | null>(null);
  const [transactions, setTransactions] = useState<PointsTransactionView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redemption, setRedemption] = useState<RedemptionResult | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedSummary, loadedTransactions] = await Promise.all([
        apiRequest<SummaryView>('/api/summary'),
        apiRequest<PointsTransactionView[]>('/api/points'),
      ]);
      setSummary(loadedSummary);
      setTransactions(loadedTransactions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Rewards could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRedeem(rewardId: string) {
    setRedeemingId(rewardId);
    setError('');
    setRedemption(null);

    try {
      const result = await postJson<RedemptionResult>('/api/rewards/redeem', { rewardId });
      setRedemption(result);
      refreshSummary();
      await load();
    } catch (redeemError) {
      setError(redeemError instanceof Error ? redeemError.message : 'Reward could not be redeemed.');
    } finally {
      setRedeemingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading rewards…" />;
  }

  const availablePoints = summary?.availablePoints ?? 0;
  const redemptions = transactions.filter((transaction) => transaction.type === 'REDEMPTION');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>Rewards</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-ink">Spend your points</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
            1 point = ₱1. Redeem for real-world rewards fulfilled by partner merchants.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Available points</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-brand-900">{availablePoints.toLocaleString('en-PH')}</p>
        </div>
      </div>

      {error ? <Alert title="Something went wrong" tone="error">{error}</Alert> : null}

      {redemption ? (
        <Alert title="Reward redeemed" tone="success">
          {redemption.rewardName} is yours. Your voucher code is{' '}
          <span className="font-mono font-black">{redemption.voucherCode}</span>. You have{' '}
          {redemption.remainingPoints.toLocaleString('en-PH')} points left.
        </Alert>
      ) : null}

      <ReferralCard variant="full" onChanged={() => void load()} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewardCatalog.map((reward) => {
          const affordable = availablePoints >= reward.points;
          return (
            <Card key={reward.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{reward.category}</p>
              <h2 className="mt-2 text-xl font-black text-ink">{reward.name}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{reward.description}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-sm font-black tabular-nums text-ink">{reward.points.toLocaleString('en-PH')} pts</p>
                <Button
                  size="sm"
                  variant={affordable ? 'primary' : 'secondary'}
                  disabled={!affordable}
                  isLoading={redeemingId === reward.id}
                  onClick={() => handleRedeem(reward.id)}
                >
                  {affordable ? 'Redeem' : `Need ${(reward.points - availablePoints).toLocaleString('en-PH')} more`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {availablePoints === 0 && transactions.length === 0 ? (
        <Card>
          <h2 className="text-xl font-black text-ink">No points yet</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Points start accumulating after the first full month of an active vault.
          </p>
          <Link href="/create-vault" className="mt-4 inline-flex"><Button>Create a vault</Button></Link>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-2xl font-black text-ink">Redemption history</h2>
        <div className="mt-5 space-y-3">
          {redemptions.length === 0 ? (
            <p className="rounded-xl border border-line bg-surface-muted p-4 text-sm font-semibold text-ink-muted">
              No redemptions yet. Rewards you redeem will show here with their voucher codes.
            </p>
          ) : redemptions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-ink">{transaction.rewardName}</p>
                <p className="mt-1 text-sm font-semibold text-ink-muted">
                  {formatDateTime(transaction.createdAt)} · Code:{' '}
                  <span className="font-mono font-black text-ink">{transaction.voucherCode}</span>
                </p>
              </div>
              <p className="shrink-0 text-sm font-black tabular-nums text-danger">
                {transaction.points.toLocaleString('en-PH')} pts
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
