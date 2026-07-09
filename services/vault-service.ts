import { TopUpFrequency, VaultMode } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { addWeeks } from '@/lib/dates';
import { prisma } from '@/lib/prisma';
import type { CreateVaultInput } from '@/lib/validators';
import { ConfigService } from '@/services/config-service';
import { RewardService } from '@/services/reward-service';
import { TopUpService } from '@/services/top-up-service';
import type { RewardClaimView, TopUpView, VaultDetailView } from '@/types/vault';

type VaultWithRelations = Prisma.VaultGetPayload<{
  include: {
    topUps: { orderBy: { dueAt: 'asc' } };
    rewards: { orderBy: { weekNumber: 'asc' } };
  };
}>;

export class VaultService {
  static calculateDurationWeeks(durationMonths: number) {
    return Math.max(1, Math.round(durationMonths * 4));
  }

  static calculateUnlockDate(durationWeeks: number) {
    return addWeeks(new Date(), durationWeeks);
  }

  static async createVault(input: CreateVaultInput) {
    const rewardRate = ConfigService.getRewardRate();
    const durationWeeks = this.calculateDurationWeeks(input.durationMonths);
    const rewardValue = RewardService.calculateRewardValue(input.targetAmount, rewardRate);
    const unlockAt = this.calculateUnlockDate(durationWeeks);

    const vault = await prisma.$transaction(async (tx) => {
      const createdVault = await tx.vault.create({
        data: {
          walletAddress: input.walletAddress,
          mode: input.mode,
          targetAmount: input.targetAmount,
          currentAmount: input.currentAmount,
          topUpAmount: input.mode === VaultMode.PERIODIC_TOP_UP ? input.topUpAmount : null,
          topUpFrequency: input.mode === VaultMode.PERIODIC_TOP_UP ? input.topUpFrequency : null,
          durationWeeks,
          rewardType: input.rewardType,
          rewardRate,
          reason: input.reason,
          unlockAt,
        },
      });

      if (input.mode === VaultMode.PERIODIC_TOP_UP && input.topUpAmount && input.topUpFrequency) {
        await TopUpService.createTopUpSchedule(tx, {
          vaultId: createdVault.id,
          amount: input.topUpAmount,
          durationWeeks,
          frequency: input.topUpFrequency,
        });
      }

      await RewardService.createWeeklyRewards(tx, {
        vaultId: createdVault.id,
        durationWeeks,
        rewardName: input.rewardType,
        rewardValue,
        makeFirstAvailable: input.mode === VaultMode.ONE_TIME_LOCK && input.currentAmount > 0,
      });

      return createdVault;
    });

    return this.getVaultDetail(vault.id);
  }

  static async getVaultDetail(id: string) {
    const vault = await prisma.vault.findUnique({
      where: { id },
      include: {
        topUps: { orderBy: { dueAt: 'asc' } },
        rewards: { orderBy: { weekNumber: 'asc' } },
      },
    });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    return this.toVaultDetailView(vault);
  }

  static async refreshVaultDetail(id: string) {
    return this.getVaultDetail(id);
  }

  private static toTopUpView(topUp: VaultWithRelations['topUps'][number]): TopUpView {
    return {
      id: topUp.id,
      amount: topUp.amount.toNumber(),
      dueAt: topUp.dueAt.toISOString(),
      paidAt: topUp.paidAt ? topUp.paidAt.toISOString() : null,
      status: topUp.status,
    };
  }

  private static toRewardClaimView(reward: VaultWithRelations['rewards'][number]): RewardClaimView {
    return {
      id: reward.id,
      weekNumber: reward.weekNumber,
      rewardName: reward.rewardName,
      rewardValue: reward.rewardValue.toNumber(),
      voucherCode: reward.voucherCode,
      status: reward.status,
      claimedAt: reward.claimedAt ? reward.claimedAt.toISOString() : null,
    };
  }

  private static toVaultDetailView(vault: VaultWithRelations): VaultDetailView {
    const currentAmount = vault.currentAmount.toNumber();
    const targetAmount = vault.targetAmount.toNumber();
    const progressPercent = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
    const topUps = vault.topUps.map(this.toTopUpView);
    const rewards = vault.rewards.map(this.toRewardClaimView);

    return {
      id: vault.id,
      walletAddress: vault.walletAddress,
      displayName: vault.displayName,
      mode: vault.mode,
      targetAmount,
      currentAmount,
      topUpAmount: vault.topUpAmount ? vault.topUpAmount.toNumber() : null,
      topUpFrequency: vault.topUpFrequency,
      durationWeeks: vault.durationWeeks,
      rewardType: vault.rewardType,
      rewardRate: vault.rewardRate.toNumber(),
      reason: vault.reason,
      status: vault.status,
      stellarBalanceId: vault.stellarBalanceId,
      stellarStatus: vault.stellarStatus,
      unlockAt: vault.unlockAt.toISOString(),
      createdAt: vault.createdAt.toISOString(),
      updatedAt: vault.updatedAt.toISOString(),
      progressPercent: Math.min(100, progressPercent),
      nextTopUp: topUps.find((topUp) => topUp.status === 'PENDING') ?? null,
      availableReward: rewards.find((reward) => reward.status === 'AVAILABLE') ?? null,
      topUps,
      rewards,
    };
  }
}
