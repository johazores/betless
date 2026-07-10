import { prisma } from '@/lib/prisma';

export class UserService {
  private static async fetchClerkProfile(clerkUserId: string) {
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;
      const displayName =
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.username ||
        null;
      return { email, displayName };
    } catch {
      return { email: null, displayName: null };
    }
  }

  static async ensureAppUser(clerkUserId: string) {
    const existing = await prisma.appUser.findUnique({ where: { clerkUserId } });
    if (existing) {
      return prisma.appUser.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date() },
      });
    }

    const profile = await this.fetchClerkProfile(clerkUserId);

    const user = await prisma.appUser.create({
      data: {
        clerkUserId,
        email: profile.email,
        displayName: profile.displayName,
        lastSeenAt: new Date(),
      },
    });

    const { NotificationService } = await import('@/services/notification-service');
    NotificationService.notifyWelcome(user.id, user.displayName);

    return user;
  }

  static async getAccountProfile(clerkUserId: string) {
    const appUser = await this.ensureAppUser(clerkUserId);

    const [activeVaults, totalVaults, recentActivity] = await Promise.all([
      prisma.vault.count({ where: { appUserId: appUser.id, status: 'ACTIVE' } }),
      prisma.vault.count({ where: { appUserId: appUser.id } }),
      prisma.pointsTransaction.findMany({
        where: { appUserId: appUser.id },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);

    const { VaultService } = await import('@/services/vault-service');
    const { PointsService } = await import('@/services/points-service');
    const [lockedBalance, availablePoints] = await Promise.all([
      VaultService.getLockedBalance(appUser.id),
      PointsService.getBalance(appUser.id),
    ]);

    return {
      displayName: appUser.displayName,
      email: appUser.email,
      referralCode: appUser.referralCode,
      verificationStatus: appUser.verificationStatus,
      memberSince: appUser.createdAt.toISOString(),
      stats: {
        lockedBalance,
        availablePoints,
        activeVaults,
        totalVaults,
      },
      recentActivity: recentActivity.map((transaction: {
        id: string;
        vaultId: string | null;
        type: string;
        points: number;
        rewardName: string | null;
        voucherCode: string | null;
        description: string;
        createdAt: Date;
      }) => ({
        id: transaction.id,
        vaultId: transaction.vaultId,
        type: transaction.type,
        points: transaction.points,
        rewardName: transaction.rewardName,
        voucherCode: transaction.voucherCode,
        description: transaction.description,
        createdAt: transaction.createdAt.toISOString(),
      })),
    };
  }

  static async updateDisplayName(clerkUserId: string, displayName: string) {
    const trimmed = displayName.trim();
    if (!trimmed) throw new Error('Display name is required.');

    const appUser = await this.ensureAppUser(clerkUserId);
    return prisma.appUser.update({
      where: { id: appUser.id },
      data: { displayName: trimmed },
    });
  }
}
