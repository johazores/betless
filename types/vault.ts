import type { PointsTransactionType, VaultStatus } from '@/lib/domain';

export type VaultView = {
  id: string;
  principal: number;
  lockMonths: number;
  status: VaultStatus;
  startAt: string;
  maturesAt: string;
  closedAt: string | null;
  withdrawalFee: number | null;
  returnedAmount: number | null;
  monthlyPoints: number;
  monthsCompleted: number;
  pointsEarned: number;
  totalPointsAtMaturity: number;
  progressPercent: number;
  /** Fee charged if the vault is withdrawn early right now. Null once closed. */
  earlyWithdrawalFee: number | null;
  createdAt: string;
};

export type PointsTransactionView = {
  id: string;
  vaultId: string | null;
  type: PointsTransactionType;
  points: number;
  rewardName: string | null;
  voucherCode: string | null;
  description: string;
  createdAt: string;
};

export type SummaryView = {
  lockedBalance: number;
  availablePoints: number;
};

export type WithdrawResult = {
  vault: VaultView;
  fee: number;
  returnedAmount: number;
};

export type RedemptionResult = {
  rewardName: string;
  points: number;
  voucherCode: string;
  remainingPoints: number;
};
