import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getStellarStatusLabel } from '@/lib/status-labels';
import { buildStellarAccountExplorerUrl } from '@/lib/stellar-explorer';
import type { VaultDetailView } from '@/types/vault';

type StellarProofCardProps = {
  vault: VaultDetailView;
  onCreateProof: () => void;
  onFund: () => void;
  onRefreshBalance: () => void;
  isLoading: boolean;
  isFunding: boolean;
  isRefreshing: boolean;
};

function shortReference(value: string) {
  if (value.length <= 32) return value;
  return `${value.slice(0, 14)}…${value.slice(-10)}`;
}

export function StellarProofCard({
  vault,
  onCreateProof,
  onFund,
  onRefreshBalance,
  isLoading,
  isFunding,
  isRefreshing,
}: StellarProofCardProps) {
  const receipt = vault.latestReceipt;
  const hasReceipt = Boolean(receipt);
  const isNetworkVerified = receipt?.status === 'NETWORK_CONFIRMED';
  const isFailed = vault.stellarStatus === 'FAILED';
  const status = isFailed
    ? 'Stellar transaction needs another try'
    : hasReceipt
      ? (isNetworkVerified ? 'Stellar transaction confirmed' : 'Wallet receipt saved')
      : getStellarStatusLabel(vault.stellarStatus);
  const explorerUrl = receipt?.explorerUrl ?? receipt?.accountExplorerUrl ?? null;
  const accountExplorerUrl = buildStellarAccountExplorerUrl(vault.walletAddress);
  const isFunded = vault.stellarNativeBalance != null;

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-700">Stellar wallet &amp; receipt</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{status}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your savings plan is tracked in pesos. The Stellar wallet below is a real on-chain account you can verify anytime.
          </p>
        </div>
        {hasReceipt && !isFailed ? (
          <Link href={`/receipts/${receipt?.id}?vault=${vault.id}`}><Button>View receipt</Button></Link>
        ) : null}
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">On-chain wallet balance</p>
              <p className="mt-1 text-xl font-black text-slate-950">
                {isFunded ? `${vault.stellarNativeBalance} XLM` : 'Not activated yet'}
              </p>
              {vault.stellarBalanceSyncedAt ? (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Synced {new Date(vault.stellarBalanceSyncedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {isFunded ? (
                <Button type="button" variant="secondary" onClick={onRefreshBalance} isLoading={isRefreshing} disabled={isRefreshing}>
                  Refresh balance
                </Button>
              ) : (
                <Button type="button" onClick={onFund} isLoading={isFunding} disabled={isFunding}>
                  Activate on testnet
                </Button>
              )}
            </div>
          </div>
          <a href={accountExplorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-black text-orange-800 underline decoration-2 underline-offset-4">
            View wallet on Stellar Explorer
          </a>
        </div>

        {isFailed ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-950">
            <p className="font-black">The network transaction did not complete.</p>
            <p className="mt-1 font-semibold leading-6">{vault.stellarError ?? 'Something went wrong while confirming on Stellar.'}</p>
            <Button type="button" className="mt-3" onClick={onCreateProof} isLoading={isLoading} disabled={isLoading}>
              Try again
            </Button>
          </div>
        ) : receipt ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-semibold">Receipt reference</p>
            <p className="mt-1 break-all font-black">{shortReference(receipt.proofReference)}</p>
            <p className="mt-2 font-semibold leading-6">{receipt.message}</p>
            {explorerUrl ? (
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-black text-emerald-800 underline decoration-2 underline-offset-4">
                View on Stellar Explorer
              </a>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p className="font-black">Next step</p>
            <p className="mt-1 font-semibold leading-6">Create a receipt so you can save, print, or connect this vault to your account later.</p>
            <Button type="button" className="mt-3" onClick={onCreateProof} isLoading={isLoading} disabled={isLoading}>
              Create receipt
            </Button>
          </div>
        )}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-semibold leading-6 text-blue-950">
          Betless only needs your public wallet address. Never enter your recovery phrase or private key.
        </div>
      </div>
    </Card>
  );
}
