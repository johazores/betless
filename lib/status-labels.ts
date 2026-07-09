import type { RewardStatus, StellarStatus, TopUpStatus, VaultMode, VaultStatus } from '@/lib/domain';

const vaultStatusLabels: Record<VaultStatus, string> = {
  ACTIVE: 'Active',
  UNLOCK_READY: 'Unlock ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const vaultModeLabels: Record<VaultMode, string> = {
  ONE_TIME_LOCK: 'One-Time Lock',
  PERIODIC_TOP_UP: 'Periodic Top-Up',
};

const topUpStatusLabels: Record<TopUpStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  MISSED: 'Missed',
};

const rewardStatusLabels: Record<RewardStatus, string> = {
  LOCKED: 'Locked',
  AVAILABLE: 'Available',
  CLAIMED: 'Claimed',
};

const stellarStatusLabels: Record<StellarStatus, string> = {
  NOT_CREATED: 'Proof not created yet',
  PENDING: 'Proof pending',
  CREATED: 'Testnet proof created',
  FAILED: 'Testnet proof unavailable',
};

export function getVaultStatusLabel(status: VaultStatus) {
  return vaultStatusLabels[status];
}

export function getVaultModeLabel(mode: VaultMode) {
  return vaultModeLabels[mode];
}

export function getTopUpStatusLabel(status: TopUpStatus) {
  return topUpStatusLabels[status];
}

export function getRewardStatusLabel(status: RewardStatus) {
  return rewardStatusLabels[status];
}

export function getStellarStatusLabel(status: StellarStatus) {
  return stellarStatusLabels[status];
}
