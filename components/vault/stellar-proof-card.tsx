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
  if (value.length <= 28) return value;
  return `${value.slice(0, 14)}…${value.slice(-8)}`;
}

export function StellarProofCard({ vault, onCreateProof, isLoading }: StellarProofCardProps) {
  const isSaved = vault.stellarStatus === 'CREATED' && Boolean(vault.stellarBalanceId);
  const status = getStellarStatusLabel(vault.stellarStatus);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-700">Commitment proof</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{status}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Save a demo proof that links this vault to the public Stellar testnet address entered during setup. This completes the proof step without asking for private keys or real funds.
          </p>
        </div>
        <Button variant={isSaved ? 'secondary' : 'primary'} onClick={onCreateProof} isLoading={isLoading} disabled={isSaved || isLoading}>
          {isSaved ? 'Proof saved' : 'Save proof'}
        </Button>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-500">What this means</p>
          <p className="mt-1 font-semibold leading-6 text-slate-800">
            The app records that this savings commitment was created for a valid public testnet address. In production, regulated partners can connect this same step to real custody, payment, and voucher systems.
          </p>
        </div>
        {isSaved ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-semibold">Proof reference</p>
            <p className="mt-1 break-all font-black">{shortReference(vault.stellarBalanceId ?? '')}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p className="font-black">Next step</p>
            <p className="mt-1 font-semibold leading-6">Click “Save proof” after creating or updating the vault so the demo has a clear ending.</p>
          </div>
        )}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-semibold leading-6 text-blue-950">
          Safety note: Betless only uses the public address. Secret keys, seed phrases, GCash details, and real deposits are never requested in this MVP.
        </div>
      </div>
    </Card>
  );
}
