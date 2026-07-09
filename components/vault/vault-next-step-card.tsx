import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPeso } from '@/lib/money';
import type { VaultDetailView } from '@/types/vault';

type VaultNextStepCardProps = {
  vault: VaultDetailView;
  onMarkTopUp: (topUpId?: string) => void;
  onClaimReward: (rewardId?: string) => void;
  onCreateProof: () => void;
  isTopUpLoading: boolean;
  isRewardLoading: boolean;
  isProofLoading: boolean;
};

export function VaultNextStepCard({
  vault,
  onMarkTopUp,
  onClaimReward,
  onCreateProof,
  isTopUpLoading,
  isRewardLoading,
  isProofLoading,
}: VaultNextStepCardProps) {
  if (vault.nextTopUp) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-amber-800">Next step</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Complete the next top-up</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              Mark {formatPeso(vault.nextTopUp.amount)} as completed to update the savings progress and unlock the next milestone reward.
            </p>
          </div>
          <Button onClick={() => onMarkTopUp(vault.nextTopUp?.id)} isLoading={isTopUpLoading} className="w-full sm:w-auto">
            Mark top-up completed
          </Button>
        </div>
      </Card>
    );
  }

  if (vault.availableReward) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-blue-800">Next step</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Claim the milestone reward</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              {vault.availableReward.rewardName} is ready. Claim it to generate the demo voucher code.
            </p>
          </div>
          <Button onClick={() => onClaimReward(vault.availableReward?.id)} isLoading={isRewardLoading} className="w-full sm:w-auto">
            Claim reward
          </Button>
        </div>
      </Card>
    );
  }

  if (vault.stellarStatus !== 'CREATED') {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-700">Final demo step</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Save the commitment proof</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
              Save a proof reference so the vault has a clear completion point for the Stellar demo.
            </p>
          </div>
          <Button onClick={onCreateProof} isLoading={isProofLoading} className="w-full sm:w-auto">
            Save proof
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <p className="text-sm font-black text-emerald-800">Demo flow complete</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">This vault has a completed end-to-end demo path.</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
        The vault is created, progress is tracked, available rewards can be claimed, and the commitment proof is saved. The next product phase is partner integration for real custody and voucher fulfillment.
      </p>
    </Card>
  );
}
