import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getStellarStatusLabel } from '@/lib/status-labels';
import type { VaultDetailView } from '@/types/vault';

type StellarProofCardProps = {
  vault: VaultDetailView;
  onCreateProof: () => void;
  isLoading: boolean;
};

function shortReference(value: string) {
  if (value.length <= 32) return value;
  return `${value.slice(0, 14)}…${value.slice(-10)}`;
}

export function StellarProofCard({ vault, onCreateProof, isLoading }: StellarProofCardProps) {
  const receipt = vault.latestReceipt;
  const hasReceipt = Boolean(receipt);
  const isNetworkVerified = receipt?.status === 'NETWORK_CONFIRMED';
  const status = hasReceipt ? (isNetworkVerified ? 'Network receipt saved' : 'Demo receipt saved') : getStellarStatusLabel(vault.stellarStatus);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-700">Commitment proof</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{status}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This receipt connects the vault to the signed-in user and the public Stellar testnet address. Users can return to the dashboard any time to review it.
          </p>
        </div>
        {hasReceipt ? (
          <Link href={`/receipts/${receipt?.id}`}><Button>View receipt</Button></Link>
        ) : (
          <Button onClick={onCreateProof} isLoading={isLoading} disabled={isLoading}>Create receipt</Button>
        )}
      </div>

      <div className="mt-6 space-y-3 text-sm">
        {receipt ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-semibold">Receipt reference</p>
            <p className="mt-1 break-all font-black">{shortReference(receipt.proofReference)}</p>
            <p className="mt-2 font-semibold leading-6">{receipt.message}</p>
            {receipt.explorerUrl ? (
              <a href={receipt.explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-black text-emerald-800 underline decoration-2 underline-offset-4">
                Verify on Stellar explorer
              </a>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p className="font-black">Next step</p>
            <p className="mt-1 font-semibold leading-6">Create a receipt so this vault has a saved proof in the user's dashboard.</p>
          </div>
        )}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-semibold leading-6 text-blue-950">
          Safety note: Betless only uses the public address. Secret keys, seed phrases, GCash details, and real deposits are never requested in this MVP.
        </div>
      </div>
    </Card>
  );
}
