import { ActivityStatus, RewardStatus, TopUpStatus, VaultStatus, decimalToNumber } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import { ActivityEventService } from '@/services/activity-event-service';
import type { VaultAccess } from '@/services/vault-access-service';
import { requireVaultAccess } from '@/services/vault-access-service';
import type { AnalyticsView, MonthlyActivityPoint, VaultGrowthPoint } from '@/types/vault';

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

function buildEventWhere(access: VaultAccess) {
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

function monthLabel(date: Date) {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export class AnalyticsService {
  static async getAnalytics(access: VaultAccess): Promise<AnalyticsView> {
    const [vaults, rewards, topUps, events] = await Promise.all([
      prisma.vault.findMany({
        where: buildVaultWhere(access),
        include: { topUps: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.rewardClaim.findMany({
        where: { vault: buildVaultWhere(access), status: RewardStatus.CLAIMED },
      }),
      prisma.topUp.findMany({
        where: { vault: buildVaultWhere(access), status: TopUpStatus.COMPLETED },
      }),
      prisma.activityEvent.findMany({
        where: buildEventWhere(access),
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const isWithdrawn = (vault: any) => vault.status === VaultStatus.COMPLETED || vault.status === VaultStatus.CANCELLED;

    // Balance excludes vaults that have been unlocked/withdrawn.
    const totalBalance = vaults
      .filter((vault: any) => !isWithdrawn(vault))
      .reduce((sum: number, vault: any) => sum + decimalToNumber(vault.currentAmount), 0);
    // Withdrawals are the balances released by unlocked/cancelled vaults.
    const totalWithdrawals = vaults
      .filter((vault: any) => isWithdrawn(vault))
      .reduce((sum: number, vault: any) => sum + decimalToNumber(vault.currentAmount), 0);
    const initialDeposits = vaults.reduce((sum: number, vault: any) => {
      const completedTopUps = vault.topUps
        .filter((topUp: any) => topUp.status === TopUpStatus.COMPLETED)
        .reduce((subTotal: number, topUp: any) => subTotal + decimalToNumber(topUp.amount), 0);
      return sum + Math.max(0, decimalToNumber(vault.currentAmount) - completedTopUps);
    }, 0);
    const completedTopUps = topUps.reduce((sum: number, topUp: any) => sum + decimalToNumber(topUp.amount), 0);
    const rewardsEarned = rewards.reduce((sum: number, reward: any) => sum + decimalToNumber(reward.rewardValue), 0);
    const targetTotal = vaults
      .filter((vault: any) => !isWithdrawn(vault))
      .reduce((sum: number, vault: any) => sum + decimalToNumber(vault.targetAmount), 0);
    const completedTransactions = events.filter((event: any) => event.status === ActivityStatus.COMPLETED).length;

    const monthlyMap = new Map<string, number>();
    for (const event of events) {
      const label = monthLabel(event.createdAt);
      monthlyMap.set(label, (monthlyMap.get(label) ?? 0) + 1);
    }

    const monthlyActivity: MonthlyActivityPoint[] = Array.from(monthlyMap.entries())
      .reverse()
      .map(([month, count]) => ({ month, count }));

    let runningBalance = 0;
    const vaultGrowth: VaultGrowthPoint[] = vaults.map((vault: any) => {
      runningBalance += decimalToNumber(vault.currentAmount);
      return {
        label: monthLabel(vault.createdAt),
        value: runningBalance,
      };
    }).slice(-6);

    return {
      totalBalance,
      totalDeposits: initialDeposits + completedTopUps,
      totalWithdrawals,
      rewardsEarned,
      rewardsRedeemed: rewards.length,
      completedTransactions,
      savingsProgressPercent: targetTotal > 0 ? Math.min(100, Math.round((totalBalance / targetTotal) * 100)) : 0,
      vaultGrowth,
      monthlyActivity,
      recentActivity: events.slice(0, 5).map(ActivityEventService.toView),
    };
  }
}
