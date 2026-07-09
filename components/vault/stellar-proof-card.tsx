import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { STELLAR_NETWORK_LABEL } from '@/lib/stellar';
import type { VaultDetailView } from '@/types/vault';

type StellarProofCardProps = {
  vault: VaultDetailView;
  onCreateProof: () => void;
  isLoading: boolean;
};

const statusCopy = {
  NOT_CREATED: 'Proof not created yet',
  PENDING: 'Proof pending',
  CREATED: 'Testnet proof created',
  FAILED: 'Testnet proof unavailable',
};

export function StellarProofCard({ vault, onCreateProof, isLoading }: StellarProofCardProps) {
  const status = statusCopy[vault.stellarStatus];

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-700">Stellar proof layer</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{status}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The MVP validates a Stellar public key and attempts a non-custodial testnet account proof. Vault creation still works if testnet is unavailable.
          </p>
        </div>
        <Button variant="secondary" onClick={onCreateProof} isLoading={isLoading}>Create proof</Button>
      </div>

      <div className="mt-6 grid gap-3 text-sm">
        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="font-semibold text-slate-500">Network</p>
          <p className="mt-1 font-black text-slate-950">{STELLAR_NETWORK_LABEL}</p>
        </div>
        <div className="rounded-2xl bg-orange-50 p-4">
          <p className="font-semibold text-slate-500">Proof reference</p>
          <p className="mt-1 break-all font-black text-slate-950">{vault.stellarBalanceId ?? 'Not available yet'}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-900">
          No private keys are used or exposed by the frontend.
        </div>
      </div>
    </Card>
  );
}
