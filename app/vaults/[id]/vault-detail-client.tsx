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
import { clearGuestSessionToken, clearVaultToken, getGuestSessionToken, getVaultToken } from '@/lib/vault-session';
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
  const [connectLoading, setConnectLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const loadVault = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = isSignedIn ? await getToken() : null;
      const vaultAccessToken = getVaultToken(id);
      const loadedVault = await apiRequest<VaultDetailView>(`/api/vaults/${id}`, undefined, { token, vaultAccessToken });
      setVault(loadedVault);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Vault could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, id, isSignedIn]);

  async function connectVaultToAccount() {
    setConnectLoading(true);
    setError('');

    try {
      const token = await getToken();
      const vaultAccessToken = getGuestSessionToken() ?? getVaultToken(id);
      await postJson('/api/session/connect', {}, { token, vaultAccessToken });
      clearVaultToken(id);
      clearGuestSessionToken();
      setIsConnected(true);
      await loadVault();
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Vault could not be connected to your account.');
    } finally {
      setConnectLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded) void loadVault();
  }, [isLoaded, loadVault]);

  useEffect(() => {
    if (isLoaded && isSignedIn && getVaultToken(id) && !isConnected) {
      void connectVaultToAccount();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, id, isConnected]);

  async function runMutation<T>(url: string, body: Record<string, unknown>, onSuccess: (data: T) => void, setPending: (pending: boolean) => void) {
    setPending(true);
    setError('');

    try {
      const token = isSignedIn ? await getToken() : null;
      const vaultAccessToken = getVaultToken(id);
      const data = await postJson<T>(url, body, { token, vaultAccessToken });
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

  if (isLoading) {
    return <LoadingState />;
  }

  if (!vault && error) {
    return (
      <Card>
        <p className="text-sm font-black text-amber-700">Access needed</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Open this vault from the same browser or sign in.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Vaults can be opened from the browser that created them. Signing in saves vaults to your dashboard.</p>
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <SignInButton mode="modal"><Button type="button" variant="secondary">Sign in</Button></SignInButton>
          <SignUpButton mode="modal"><Button type="button">Create account</Button></SignUpButton>
        </div>
      </Card>
    );
  }

  if (!vault) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={isSignedIn ? '/dashboard' : '/'} className="text-sm font-bold text-orange-800 hover:text-orange-900">← Back</Link>
        <Link href="/create-vault" className="text-sm font-bold text-slate-600 hover:text-slate-950">Create another vault</Link>
      </div>

      {isSignedIn && connectLoading ? <Alert title="Saving vault" tone="success">Connecting your vaults and receipts to your account…</Alert> : null}
      {!isSignedIn ? (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-blue-800">Save this vault</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Connect an account to access it later.</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Your vault works now. Sign in when you want dashboard and receipt history.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SignInButton mode="modal"><Button type="button" variant="secondary">Sign in</Button></SignInButton>
              <SignUpButton mode="modal"><Button type="button">Create account</Button></SignUpButton>
            </div>
          </div>
        </Card>
      ) : null}

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
