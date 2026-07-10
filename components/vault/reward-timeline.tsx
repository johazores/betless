import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPeso } from '@/lib/money';
import { getRewardStatusLabel } from '@/lib/status-labels';
import type { RewardClaimView, VaultDetailView } from '@/types/vault';

type RewardTimelineProps = {
  vault: VaultDetailView;
  onClaimReward: (rewardId?: string) => void;
  isLoading: boolean;
};

function RewardStatusPill({ reward }: { reward: RewardClaimView }) {
  const className = reward.status === 'CLAIMED'
    ? 'bg-emerald-100 text-emerald-800'
    : reward.status === 'AVAILABLE'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-slate-100 text-slate-600';

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>{getRewardStatusLabel(reward.status)}</span>;
}

function getRewardHeading(vault: VaultDetailView) {
  if (vault.availableReward) return `${vault.availableReward.rewardName} is ready`;
  if (vault.rewards.every((reward) => reward.status === 'CLAIMED')) return 'Milestone rewards claimed';
  if (vault.mode === 'ONE_TIME_LOCK') return 'Claim the available one-time reward';
  return 'Complete the next top-up to unlock a reward';
}

export function RewardTimeline({ vault, onClaimReward, isLoading }: RewardTimelineProps) {
  const visibleRewards = vault.rewards.slice(0, 8);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-700">Milestone reward timeline</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">{getRewardHeading(vault)}</h2>
          <p className="mt-2 text-sm text-slate-600">Rewards are fixed progress incentives based on the savings target.</p>
        </div>
        <Button
          onClick={() => onClaimReward(vault.availableReward?.id)}
          disabled={!vault.availableReward}
          isLoading={isLoading}
        >
          Claim milestone reward
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {visibleRewards.map((reward) => (
          <div key={reward.id} className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-slate-950">Milestone {reward.weekNumber}: {reward.rewardName}</p>
              <p className="text-sm text-slate-600">{formatPeso(reward.rewardValue)} value {reward.voucherCode ? `• ${reward.voucherCode}` : ''}</p>
            </div>
            <RewardStatusPill reward={reward} />
          </div>
        ))}
      </div>
    </Card>
  );
}
