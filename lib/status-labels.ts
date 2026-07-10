import type { VaultStatus } from '@/lib/domain';

const vaultStatusLabels: Record<VaultStatus, string> = {
  ACTIVE: 'Locked',
  MATURED: 'Matured',
  WITHDRAWN_EARLY: 'Withdrawn early',
};

export function getVaultStatusLabel(status: VaultStatus) {
  return vaultStatusLabels[status];
}
