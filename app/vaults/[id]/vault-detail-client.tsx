'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Progress } from '@/components/ui/progress';
import { Stat } from '@/components/ui/stat';
import { ShareVerificationCard } from '@/components/vault/share-verification-card';
import { apiRequest, postJson } from '@/lib/api-client';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { getVaultStatusLabel } from '@/lib/status-labels';
import { refreshSummary } from '@/lib/summary-events';
import type { VaultStellarView, VaultView, WithdrawResult } from '@/types/vault';

export function VaultDetailClient({ id }: { id: string }) {
  const [vault, setVault] = useState<VaultView | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResult | null>(null);

  const loadVault = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const loadedVault = await apiRequest<VaultView>(`/api/vaults/${id}`);
      setVault(loadedVault);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Vault could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadVault();
  }, [loadVault]);

  async function handleWithdraw() {
    setIsWithdrawing(true);
    setError('');

    try {
      const result = await postJson<WithdrawResult>(`/api/vaults/${id}/withdraw`);
      setVault(result.vault);
      setWithdrawResult(result);
      setConfirmingWithdraw(false);
      refreshSummary();
    } catch (withdrawError) {
      setError(withdrawError instanceof Error ? withdrawError.message : 'Withdrawal could not be completed.');
    } finally {
      setIsWithdrawing(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading vault…" />;
  }

  if (!vault) {
    return <EmptyState title="Vault not found" message={error || 'This vault does not exist or belongs to another account.'} />;
  }

  const isActive = vault.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard" className="text-sm font-bold text-brand-800 hover:text-brand-900">← Back to dashboard</Link>
        <Link href="/rewards" className="text-sm font-bold text-ink-muted hover:text-ink">Redeem rewards</Link>
      </div>

      {error ? <Alert title="Action could not be completed" tone="error">{error}</Alert> : null}

      {withdrawResult ? (
        <Alert title="Withdrawal complete" tone="success">
          {formatPeso(withdrawResult.returnedAmount)} is on its way back to you.
          A fee of {formatPeso(withdrawResult.fee)} was applied. Your {vault.pointsEarned.toLocaleString('en-PH')} earned points are safe.
        </Alert>
      ) : null}

      {vault.status === 'MATURED' ? (
        <Alert title="Vault matured" tone="success">
          Your full deposit of {formatPeso(vault.principal)} was returned on {formatShortDate(vault.closedAt ?? vault.maturesAt)}.
          All points you earned stay in your balance.
        </Alert>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black text-brand-700">
              {vault.goalName ?? `${vault.lockMonths}-month commitment vault`}
            </p>
            <h1 className="mt-2 text-4xl font-black text-ink">{formatPeso(vault.principal)}</h1>
            <p className="mt-2 text-sm font-semibold text-ink-muted">
              Started {formatShortDate(vault.startAt)} · {isActive ? `matures ${formatShortDate(vault.maturesAt)}` : `closed ${formatShortDate(vault.closedAt ?? vault.maturesAt)}`}
              {vault.sourceAmount != null && vault.lockPercent != null
                ? ` · ${vault.lockPercent}% of ${formatPeso(vault.sourceAmount)} remittance`
                : ''}
            </p>
          </div>
          <span className="w-fit rounded-full bg-surface-sunken px-3 py-1 text-xs font-black text-ink">
            {getVaultStatusLabel(vault.status)}
          </span>
        </div>

        {isActive ? (
          <div className="mt-6">
            <Progress
              value={vault.progressPercent}
              label={`${vault.monthsCompleted} of ${vault.lockMonths} months completed`}
              showValue
            />
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Points per month" value={vault.monthlyPoints.toLocaleString('en-PH')} hint="Starting after your first full month" />
          <Stat label="Points earned so far" value={vault.pointsEarned.toLocaleString('en-PH')} />
          <Stat label="Points at maturity" value={vault.totalPointsAtMaturity.toLocaleString('en-PH')} hint="If held to the end" />
        </div>
      </Card>

      {vault.stellar ? <OnChainCard stellar={vault.stellar} /> : null}

      <ShareVerificationCard verificationUrl={vault.verificationUrl} goalName={vault.goalName} />

      {isActive ? (
        <Card>
          <h2 className="text-2xl font-black text-ink">Need the money early?</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            You can withdraw your deposit before maturity. An early withdrawal fee applies, and the vault closes.
            Points you have already earned stay in your balance.
          </p>

          <div className="mt-5 rounded-2xl border border-line bg-surface-muted p-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-ink-muted">Locked deposit</dt>
                <dd className="font-black text-ink">{formatPeso(vault.principal)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-muted">Early withdrawal fee</dt>
                <dd className="font-black text-danger">− {formatPeso(vault.earlyWithdrawalFee ?? 0)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-muted">You receive</dt>
                <dd className="font-black text-ink">{formatPeso(vault.principal - (vault.earlyWithdrawalFee ?? 0))}</dd>
              </div>
            </dl>
          </div>

          {confirmingWithdraw ? (
            <div className="mt-5 space-y-4">
              <Alert title="Please confirm" tone="info">
                This closes the vault today. You receive {formatPeso(vault.principal - (vault.earlyWithdrawalFee ?? 0))} after
                the {formatPeso(vault.earlyWithdrawalFee ?? 0)} fee, and no further points are earned.
              </Alert>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleWithdraw} isLoading={isWithdrawing}>
                  Yes, withdraw {formatPeso(vault.principal - (vault.earlyWithdrawalFee ?? 0))}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmingWithdraw(false)} disabled={isWithdrawing}>
                  Keep saving
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" className="mt-5" onClick={() => setConfirmingWithdraw(true)}>
              Withdraw early
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <h2 className="text-2xl font-black text-ink">Closing summary</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-ink-muted">Amount returned</dt>
              <dd className="font-black text-ink">{vault.returnedAmount != null ? formatPeso(vault.returnedAmount) : '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Fee charged</dt>
              <dd className="font-black text-ink">{vault.withdrawalFee != null ? formatPeso(vault.withdrawalFee) : formatPeso(0)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink-muted">Points kept</dt>
              <dd className="font-black text-ink">{vault.pointsEarned.toLocaleString('en-PH')}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

const onChainStatusCopy: Record<VaultStellarView['status'], { label: string; description: string }> = {
  PENDING: {
    label: 'Lock in progress',
    description: 'Your deposit is being locked on the Stellar network. This usually settles within a few seconds.',
  },
  LOCKED: {
    label: 'Locked on Stellar',
    description:
      'Your deposit sits in a claimable balance that the Stellar network itself will not release before your maturity date.',
  },
  RELEASED: {
    label: 'Released on Stellar',
    description: 'The on-chain lock has been claimed and your deposit was settled back for payout.',
  },
  FAILED: {
    label: 'On-chain lock unavailable',
    description: 'The on-chain lock could not be completed. Your vault and points are unaffected.',
  },
};

function OnChainCard({ stellar }: { stellar: VaultStellarView }) {
  const copy = onChainStatusCopy[stellar.status];

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-ink">On-chain verification</h2>
        <span className="w-fit rounded-full bg-surface-sunken px-3 py-1 text-xs font-black text-ink">{copy.label}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{copy.description}</p>

      {stellar.claimableBalanceId ? (
        <p className="mt-4 break-all rounded-2xl border border-line bg-surface-muted p-4 font-mono text-xs text-ink-muted">
          Claimable balance: {stellar.claimableBalanceId}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
        {stellar.lockExplorerUrl ? (
          <a href={stellar.lockExplorerUrl} target="_blank" rel="noreferrer" className="text-brand-800 hover:text-brand-900">
            View lock transaction ↗
          </a>
        ) : null}
        {stellar.releaseExplorerUrl ? (
          <a href={stellar.releaseExplorerUrl} target="_blank" rel="noreferrer" className="text-brand-800 hover:text-brand-900">
            View release transaction ↗
          </a>
        ) : null}
      </div>
    </Card>
  );
}
