import { prisma } from '@/lib/prisma';
import { formatPeso } from '@/lib/money';
import type { VaultAccess } from '@/services/vault-access-service';
import { requireVaultAccess } from '@/services/vault-access-service';
import type { ActivityItemView } from '@/types/vault';

function buildVaultWhere(access: VaultAccess) {
  requireVaultAccess(access);

  const conditions: Array<Record<string, unknown>> = [];

  if (access.clerkUserId) {
    conditions.push({ appUser: { clerkUserId: access.clerkUserId } });
  }

  if (access.vaultAccessTokenHash) {
    conditions.push({ guestAccessTokenHash: access.vaultAccessTokenHash });
  }

  return { OR: conditions };
}

export class ActivityService {
  static async listActivity(access: VaultAccess): Promise<ActivityItemView[]> {
    const vaults = await prisma.vault.findMany({
      where: buildVaultWhere(access),
      include: {
        topUps: { where: { status: 'COMPLETED' }, orderBy: { paidAt: 'desc' } },
        rewards: { where: { status: 'CLAIMED' }, orderBy: { claimedAt: 'desc' } },
        receipts: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activity: ActivityItemView[] = [];

    for (const vault of vaults) {
      activity.push({
        id: `vault-${vault.id}`,
        type: 'VAULT_CREATED',
        title: 'Vault created',
        description: `${formatPeso(Number(vault.currentAmount))} saved toward ${formatPeso(Number(vault.targetAmount))}`,
        href: `/vaults/${vault.id}`,
        createdAt: vault.createdAt.toISOString(),
      });

      for (const topUp of vault.topUps) {
        activity.push({
          id: `top-up-${topUp.id}`,
          type: 'TOP_UP_COMPLETED',
          title: 'Top-up completed',
          description: `${formatPeso(Number(topUp.amount))} added to your vault`,
          href: `/vaults/${vault.id}`,
          createdAt: (topUp.paidAt ?? topUp.createdAt).toISOString(),
        });
      }

      for (const reward of vault.rewards) {
        activity.push({
          id: `reward-${reward.id}`,
          type: 'REWARD_CLAIMED',
          title: 'Reward claimed',
          description: `${reward.rewardName} · ${formatPeso(Number(reward.rewardValue))}`,
          href: `/vaults/${vault.id}`,
          createdAt: (reward.claimedAt ?? reward.createdAt).toISOString(),
        });
      }

      for (const receipt of vault.receipts) {
        activity.push({
          id: `receipt-${receipt.id}`,
          type: 'RECEIPT_CREATED',
          title: receipt.status === 'NETWORK_CONFIRMED' ? 'Network receipt saved' : 'Receipt saved',
          description: receipt.proofReference,
          href: `/receipts/${receipt.id}`,
          createdAt: receipt.createdAt.toISOString(),
        });
      }
    }

    return activity.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
}
