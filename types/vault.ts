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
  goalName: string | null;
  sourceAmount: number | null;
  lockPercent: number | null;
  verificationToken: string;
  verificationUrl: string;
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

export type PublicVaultVerifyView = {
  goalName: string | null;
  principal: number;
  lockMonths: number;
  status: VaultStatus;
  maturesAt: string;
  sourceAmount: number | null;
  lockPercent: number | null;
  spendableAmount: number | null;
  stellar: VaultStellarView | null;
};

export type ReservesVaultItem = {
  goalName: string | null;
  principal: number;
  maturesAt: string;
  stellarStatus: VaultStellarView['status'] | null;
  verifyPath: string;
};

export type ReservesView = {
  stellarEnabled: boolean;
  networkLabel: string;
  treasuryExplorerUrl: string | null;
  totalLocked: number;
  activeVaultCount: number;
  onChainConfirmedCount: number;
  onChainLockedTotal: number;
  vaults: ReservesVaultItem[];
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
