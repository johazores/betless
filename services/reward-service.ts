import { RewardStatus, decimalToNumber } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import { buildVaultAccessWhere, type VaultAccess } from '@/services/vault-access-service';
import { VoucherService } from '@/services/voucher-service';

type DbClient = any;

export class RewardService {
  static calculateRewardValue(targetAmount: number, rewardRate: number) {
    return Math.max(20, Math.round(targetAmount * rewardRate));
  }

  static buildWeeklyRewards(params: {
    vaultId: string;
    durationWeeks: number;
    rewardName: string;
    rewardValue: number;
    makeFirstAvailable?: boolean;
  }) {
    return Array.from({ length: params.durationWeeks }).map((_, index) => ({
      vaultId: params.vaultId,
      weekNumber: index + 1,
      rewardName: params.rewardName,
      rewardValue: params.rewardValue,
      status: index === 0 && params.makeFirstAvailable ? RewardStatus.AVAILABLE : RewardStatus.LOCKED,
    }));
  }

  static async createWeeklyRewards(client: DbClient, params: {
    vaultId: string;
    durationWeeks: number;
    rewardName: string;
    rewardValue: number;
    makeFirstAvailable?: boolean;
  }) {
    const rewards = this.buildWeeklyRewards(params);

    if (rewards.length === 0) {
      return;
    }

    await client.rewardClaim.createMany({ data: rewards });
  }

  static async claimReward(vaultId: string, access: VaultAccess, rewardId?: string) {
    return prisma.$transaction(async (tx: any) => {
      const vault = await tx.vault.findFirst({ where: buildVaultAccessWhere(vaultId, access) });

      if (!vault) {
        throw new Error('Vault not found.');
      }

      const reward = rewardId
        ? await tx.rewardClaim.findFirst({ where: { id: rewardId, vaultId } })
        : await tx.rewardClaim.findFirst({ where: { vaultId, status: RewardStatus.AVAILABLE }, orderBy: { weekNumber: 'asc' } });

      if (!reward) {
        throw new Error('No reward is available yet. Complete a top-up first.');
      }

      if (reward.status === RewardStatus.CLAIMED) {
        throw new Error('This reward was already claimed.');
      }

      if (reward.status !== RewardStatus.AVAILABLE) {
        throw new Error('This reward is not available yet.');
      }

      const voucher = VoucherService.createVoucher(reward.rewardName, decimalToNumber(reward.rewardValue));

      await tx.rewardClaim.update({
        where: { id: reward.id },
        data: {
          voucherCode: voucher.code,
          status: RewardStatus.CLAIMED,
          claimedAt: new Date(),
        },
      });

      return voucher;
    });
  }
}
