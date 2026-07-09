import type { RewardStatus, StellarStatus, TopUpFrequency, TopUpStatus, VaultMode, VaultStatus } from '@/lib/domain';

export type TopUpView = {
  id: string;
  amount: number;
  dueAt: string;
  paidAt: string | null;
  status: TopUpStatus;
};

export type RewardClaimView = {
  id: string;
  weekNumber: number;
  rewardName: string;
  rewardValue: number;
  voucherCode: string | null;
  status: RewardStatus;
  claimedAt: string | null;
};

export type VaultDetailView = {
  id: string;
  walletAddress: string;
  displayName: string | null;
  mode: VaultMode;
  targetAmount: number;
  currentAmount: number;
  topUpAmount: number | null;
  topUpFrequency: TopUpFrequency | null;
  durationWeeks: number;
  rewardType: string;
  rewardRate: number;
  reason: string | null;
  status: VaultStatus;
  stellarBalanceId: string | null;
  stellarStatus: StellarStatus;
  unlockAt: string;
  createdAt: string;
  updatedAt: string;
  progressPercent: number;
  nextTopUp: TopUpView | null;
  availableReward: RewardClaimView | null;
  topUps: TopUpView[];
  rewards: RewardClaimView[];
};

export type VoucherResult = {
  code: string;
  name: string;
  value: number;
  demoOnlyMessage: string;
};
