import type { ApiVaultAccess } from '@/lib/auth';

export type VaultAccess = ApiVaultAccess;

export function requireVaultAccess(access: VaultAccess) {
  if (!access.clerkUserId && !access.vaultAccessTokenHash) {
    throw new Error('Please sign in or open the saved vault link from this device.');
  }
}

export function buildVaultAccessWhere(vaultId: string, access: VaultAccess) {
  requireVaultAccess(access);

  const conditions: Array<Record<string, unknown>> = [];

  if (access.clerkUserId) {
    conditions.push({ appUser: { clerkUserId: access.clerkUserId } });
  }

  if (access.vaultAccessTokenHash) {
    conditions.push({ guestAccessTokenHash: access.vaultAccessTokenHash });
  }

  return {
    id: vaultId,
    OR: conditions,
  };
}
