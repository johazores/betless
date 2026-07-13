import type { VaultView } from '@/types/vault';

export type CommitmentStatsView = {
  /** Sum of completed months across all active vaults. */
  monthsCommitted: number;
  /** Longest uninterrupted lock progress on any active vault. */
  longestStreak: number;
  /** Total principal ever deposited across all vaults. */
  lifetimeDeposits: number;
  /** Vaults that reached maturity without early withdrawal. */
  completedVaults: number;
};

export function computeCommitmentStats(vaults: VaultView[]): CommitmentStatsView {
  const activeVaults = vaults.filter((vault) => vault.status === 'ACTIVE');

  return {
    monthsCommitted: activeVaults.reduce((sum, vault) => sum + vault.monthsCompleted, 0),
    longestStreak: activeVaults.reduce((max, vault) => Math.max(max, vault.monthsCompleted), 0),
    lifetimeDeposits: vaults.reduce((sum, vault) => sum + vault.principal, 0),
    completedVaults: vaults.filter((vault) => vault.status === 'MATURED').length,
  };
}
