import type {
  ActivityEventType,
  ActivityRail,
  ActivityStatus,
  ProofReceiptStatus,
  RewardStatus,
  StellarStatus,
  TopUpFrequency,
  TopUpStatus,
  VaultMode,
  VaultStatus,
} from '@/lib/domain';

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

export type ProofReceiptView = {
  id: string;
  vaultId: string;
  status: ProofReceiptStatus;
  network: string;
  publicAddress: string;
  proofReference: string;
  transactionHash: string | null;
  operationId: string | null;
  ledger: number | null;
  memo: string | null;
  explorerUrl: string | null;
  message: string;
  createdAt: string;
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
  receipts: ProofReceiptView[];
  latestReceipt: ProofReceiptView | null;
};

export type VoucherResult = {
  code: string;
  name: string;
  value: number;
};

export type DashboardVaultView = {
  id: string;
  status: VaultStatus;
  mode: VaultMode;
  targetAmount: number;
  currentAmount: number;
  progressPercent: number;
  rewardType: string;
  unlockAt: string;
  createdAt: string;
  stellarStatus: StellarStatus;
  latestReceipt: ProofReceiptView | null;
};

export type ActivityItemView = {
  id: string;
  type: ActivityEventType;
  rail: ActivityRail;
  status: ActivityStatus;
  title: string;
  description: string;
  walletAddress: string | null;
  amount: number | null;
  assetCode: string | null;
  transactionHash: string | null;
  operationId: string | null;
  ledger: number | null;
  reference: string | null;
  explorerUrl: string | null;
  vaultId: string | null;
  receiptId: string | null;
  href: string;
  createdAt: string;
};

export type MonthlyActivityPoint = {
  month: string;
  count: number;
};

export type VaultGrowthPoint = {
  label: string;
  value: number;
};

export type AnalyticsView = {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  completedTransactions: number;
  savingsProgressPercent: number;
  vaultGrowth: VaultGrowthPoint[];
  monthlyActivity: MonthlyActivityPoint[];
  recentActivity: ActivityItemView[];
};
