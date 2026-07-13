import type { PointsTransactionType, VaultStatus } from '@/lib/domain';

export type VaultView = {
  id: string;
  principal: number;
  lockMonths: number;
  goalLabel: string | null;
  paymentMethod: string | null;
  paymentMethodName: string | null;
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
  /** On-chain settlement state. Null when the Stellar layer is not configured. */
  stellar: VaultStellarView | null;
  createdAt: string;
};

export type VaultStellarView = {
  status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'FAILED';
  claimableBalanceId: string | null;
  lockTxHash: string | null;
  releaseTxHash: string | null;
  lockExplorerUrl: string | null;
  releaseExplorerUrl: string | null;
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

export type ReferralInfoView = {
  referralCode: string;
  referralCount: number;
  bonusPoints: number;
  hasClaimedCode: boolean;
};

export type ClaimReferralResult = {
  bonusPoints: number;
  referrerName: string | null;
};

export type VaultVerificationView = {
  id: string;
  principal: number;
  lockMonths: number;
  goalLabel: string | null;
  status: VaultStatus;
  maturesAt: string;
  closedAt: string | null;
  progressPercent: number;
  monthsCompleted: number;
  stellar: VaultStellarView | null;
};
