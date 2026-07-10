'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiRequest, postJson } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { RewardCard } from '@/components/vault/reward-card';
import { RewardTimeline } from '@/components/vault/reward-timeline';
import { StellarProofCard } from '@/components/vault/stellar-proof-card';
import { TopUpSchedule } from '@/components/vault/top-up-schedule';
import { UnlockCard } from '@/components/vault/unlock-card';
import { VaultSummaryCard } from '@/components/vault/vault-summary-card';
import { VaultNextStepCard } from '@/components/vault/vault-next-step-card';
import { Card } from '@/components/ui/card';
import type { VaultDetailView, VoucherResult } from '@/types/vault';

type VaultDetailClientProps = {
  id: string;
};

export function VaultDetailClient({ id }: VaultDetailClientProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
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
      const token = await getToken();
      const loadedVault = await apiRequest<VaultDetailView>(`/api/vaults/${id}`, undefined, token);
      setVault(loadedVault);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Vault could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, id]);

  useEffect(() => {
    if (isLoaded && isSignedIn) void loadVault();
    if (isLoaded && !isSignedIn) setIsLoading(false);
  }, [isLoaded, isSignedIn, loadVault]);

  async function runMutation<T>(url: string, body: Record<string, unknown>, onSuccess: (data: T) => void, setPending: (pending: boolean) => void) {
    setPending(true);
    setError('');

    try {
      const token = await getToken();
      const data = await postJson<T>(url, body, token);
      onSuccess(data);
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

  if (isLoaded && !isSignedIn) {
    return (
      <Card>
        <p className="text-sm font-black text-amber-700">Account required</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Sign in to view this vault.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Vault details and receipts are private to the account that created them.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <SignInButton mode="modal"><Button type="button" variant="secondary">Log in</Button></SignInButton>
          <SignUpButton mode="modal"><Button type="button">Create account</Button></SignUpButton>
        </div>
      </Card>
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
        <Link href="/dashboard" className="text-sm font-bold text-orange-800 hover:text-orange-900">← Back to dashboard</Link>
        <Link href="/create-vault" className="text-sm font-bold text-slate-600 hover:text-slate-950">Create another vault</Link>
      </div>

      {error ? <Alert title="Action could not be completed" tone="error">{error}</Alert> : null}
      {voucher ? <RewardCard voucher={voucher} /> : null}

      <VaultSummaryCard vault={vault} />
      <VaultNextStepCard
        vault={vault}
        onMarkTopUp={handleMarkTopUp}
        onClaimReward={handleClaimReward}
        onCreateProof={handleCreateProof}
        isTopUpLoading={topUpLoading}
        isRewardLoading={rewardLoading}
        isProofLoading={proofLoading}
      />

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
