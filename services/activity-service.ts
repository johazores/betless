import { prisma } from '@/lib/prisma';
import { ActivityEventService } from '@/services/activity-event-service';
import type { VaultAccess } from '@/services/vault-access-service';
import { requireVaultAccess } from '@/services/vault-access-service';
import type { ActivityItemView } from '@/types/vault';

function buildActivityWhere(access: VaultAccess) {
  requireVaultAccess(access);

  const conditions: Array<Record<string, unknown>> = [];

  if (access.clerkUserId) {
    conditions.push({ appUser: { clerkUserId: access.clerkUserId } });
    conditions.push({ vault: { appUser: { clerkUserId: access.clerkUserId } } });
  }

  if (access.vaultAccessTokenHash) {
    conditions.push({ vault: { guestAccessTokenHash: access.vaultAccessTokenHash } });
  }

  return { OR: conditions };
}

export class ActivityService {
  static async listActivity(access: VaultAccess): Promise<ActivityItemView[]> {
    const events = await prisma.activityEvent.findMany({
      where: buildActivityWhere(access),
      orderBy: { createdAt: 'desc' },
    });

    return events.map(ActivityEventService.toView);
  }
}
