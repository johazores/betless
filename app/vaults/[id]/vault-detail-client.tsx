'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { RewardCard } from '@/components/vault/reward-card';
import { RewardTimeline } from '@/components/vault/reward-timeline';
import { StellarProofCard } from '@/components/vault/stellar-proof-card';
import { TopUpSchedule } from '@/components/vault/top-up-schedule';
import { UnlockCard } from '@/components/vault/unlock-card';
import { VaultSummaryCard } from '@/components/vault/vault-summary-card';
import type { VaultDetailView, VoucherResult } from '@/types/vault';

type ApiPayload<T> = { ok: true; data: T } | { ok: false; error: string };

type VaultDetailClientProps = {
  id: string;
};

export function VaultDetailClient({ id }: VaultDetailClientProps) {
  const [vault, setVault] = useState<VaultDetailView | null>(null);
  const [voucher, setVoucher] = useState<VoucherResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);

  const loadVault = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/vaults/${id}`);
      const payload = (await response.json()) as ApiPayload<VaultDetailView>;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? 'Vault could not be loaded.' : payload.error);
      }

      setVault(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Vault could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadVault();
  }, [loadVault]);

  async function runMutation<T>(url: string, body: Record<string, unknown>, onSuccess: (data: T) => void, setPending: (pending: boolean) => void) {
    setPending(true);
    setError('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as ApiPayload<T>;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? 'Request failed.' : payload.error);
      }

      onSuccess(payload.data);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Request failed.');
    } finally {
      setPending(false);
    }
  }

  function handleMarkTopUp(topUpId?: string) {
    void runMutation<VaultDetailView>(
      `/api/vaults/${id}/mark-top-up`,
      { topUpId },
      (updatedVault) => setVault(updatedVault),
      setTopUpLoading,
    );
  }

  function handleClaimReward(rewardId?: string) {
    void runMutation<{ vault: VaultDetailView; voucher: VoucherResult }>(
      `/api/vaults/${id}/claim-reward`,
      { rewardId },
      (data) => {
        setVault(data.vault);
        setVoucher(data.voucher);
      },
      setRewardLoading,
    );
  }

  function handleCreateProof() {
    void runMutation<VaultDetailView>(
      `/api/vaults/${id}/create-stellar-proof`,
      {},
      (updatedVault) => setVault(updatedVault),
      setProofLoading,
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!vault && error) {
    return <EmptyState title="Vault could not be loaded" message={error} />;
  }

  if (!vault) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/create-vault" className="text-sm font-bold text-orange-800 hover:text-orange-900">← Create another vault</Link>
        <Link href="/" className="text-sm font-bold text-slate-600 hover:text-slate-950">Back to landing</Link>
      </div>

      {error ? <Alert title="Action could not be completed" tone="error">{error}</Alert> : null}
      {voucher ? <RewardCard voucher={voucher} /> : null}

      <VaultSummaryCard vault={vault} />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <UnlockCard vault={vault} />
        <TopUpSchedule vault={vault} onMarkTopUp={handleMarkTopUp} isLoading={topUpLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <RewardTimeline vault={vault} onClaimReward={handleClaimReward} isLoading={rewardLoading} />
        <StellarProofCard vault={vault} onCreateProof={handleCreateProof} isLoading={proofLoading} />
      </div>
    </div>
  );
}
