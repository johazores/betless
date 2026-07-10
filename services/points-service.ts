import crypto from 'node:crypto';
import { PointsTransactionType } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import { getRewardById } from '@/lib/rewards';
import { UserService } from '@/services/user-service';
import { VaultService } from '@/services/vault-service';
import type { PointsTransactionView, RedemptionResult } from '@/types/vault';

function generateVoucherCode() {
  return `BTL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export class PointsService {
  static async getBalance(appUserId: string) {
    const result = await prisma.pointsTransaction.aggregate({
      where: { appUserId },
      _sum: { points: true },
    });

    return result._sum.points ?? 0;
  }

  static async listTransactions(
    clerkUserId: string,
    options?: { sync?: boolean },
  ): Promise<PointsTransactionView[]> {
    const appUser = await UserService.ensureAppUser(clerkUserId);
    if (options?.sync !== false) {
      await VaultService.syncVaults(appUser.id);
    }

    const transactions = await prisma.pointsTransaction.findMany({
      where: { appUserId: appUser.id },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((transaction: any) => ({
      id: transaction.id,
      vaultId: transaction.vaultId,
      type: transaction.type,
      points: transaction.points,
      rewardName: transaction.rewardName,
      voucherCode: transaction.voucherCode,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
    }));
  }

  static async redeemReward(clerkUserId: string, rewardId: string): Promise<RedemptionResult> {
    const appUser = await UserService.ensureAppUser(clerkUserId);
    await VaultService.syncVaults(appUser.id);

    const reward = getRewardById(rewardId);

    if (!reward) {
      throw new Error('This reward is not available.');
    }

    const voucherCode = generateVoucherCode();

    const remainingPoints = await prisma.$transaction(async (tx: any) => {
      // Lock the user row so concurrent redemptions cannot overspend points.
      await tx.$queryRaw`SELECT id FROM "AppUser" WHERE id = ${appUser.id} FOR UPDATE`;

      const balanceResult = await tx.pointsTransaction.aggregate({
        where: { appUserId: appUser.id },
        _sum: { points: true },
      });
      const balance = balanceResult._sum.points ?? 0;

      if (balance < reward.points) {
        throw new Error(`You need ${reward.points - balance} more points for this reward.`);
      }

      await tx.pointsTransaction.create({
        data: {
          appUserId: appUser.id,
          type: PointsTransactionType.REDEMPTION,
          points: -reward.points,
          rewardName: reward.name,
          voucherCode,
          description: `Redeemed ${reward.name}`,
        },
      });

      return balance - reward.points;
    });

    return {
      rewardName: reward.name,
      points: reward.points,
      voucherCode,
      remainingPoints,
    };
  }
}
