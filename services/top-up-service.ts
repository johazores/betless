import { TopUpFrequency, TopUpStatus, VaultStatus } from '@prisma/client';
import type { Prisma, PrismaClient } from '@prisma/client';
import { addMonths, addWeeks } from '@/lib/dates';
import { prisma } from '@/lib/prisma';

type DbClient = PrismaClient | Prisma.TransactionClient;

export class TopUpService {
  static buildTopUpSchedule(params: {
    vaultId: string;
    amount: number;
    durationWeeks: number;
    frequency: TopUpFrequency;
    startDate?: Date;
  }) {
    const startDate = params.startDate ?? new Date();
    const count = params.frequency === TopUpFrequency.WEEKLY
      ? params.durationWeeks
      : Math.max(1, Math.ceil(params.durationWeeks / 4));

    return Array.from({ length: count }).map((_, index) => {
      const dueAt = params.frequency === TopUpFrequency.WEEKLY
        ? addWeeks(startDate, index + 1)
        : addMonths(startDate, index + 1);

      return {
        vaultId: params.vaultId,
        amount: params.amount,
        dueAt,
      };
    });
  }

  static async createTopUpSchedule(client: DbClient, params: {
    vaultId: string;
    amount: number;
    durationWeeks: number;
    frequency: TopUpFrequency;
  }) {
    const schedule = this.buildTopUpSchedule(params);

    if (schedule.length === 0) {
      return;
    }

    await client.topUp.createMany({ data: schedule });
  }

  static async markTopUpCompleted(vaultId: string, topUpId?: string) {
    await prisma.$transaction(async (tx) => {
      const topUp = topUpId
        ? await tx.topUp.findFirst({ where: { id: topUpId, vaultId } })
        : await tx.topUp.findFirst({ where: { vaultId, status: TopUpStatus.PENDING }, orderBy: { dueAt: 'asc' } });

      if (!topUp) {
        throw new Error('No pending top-up is available.');
      }

      if (topUp.status === TopUpStatus.COMPLETED) {
        throw new Error('This top-up has already been completed.');
      }

      const vault = await tx.vault.findUnique({ where: { id: vaultId } });

      if (!vault) {
        throw new Error('Vault not found.');
      }

      const nextAmount = vault.currentAmount.add(topUp.amount);
      const goalReached = nextAmount.greaterThanOrEqualTo(vault.targetAmount);

      await tx.topUp.update({
        where: { id: topUp.id },
        data: {
          status: TopUpStatus.COMPLETED,
          paidAt: new Date(),
        },
      });

      await tx.vault.update({
        where: { id: vaultId },
        data: {
          currentAmount: nextAmount,
          status: goalReached ? VaultStatus.UNLOCK_READY : VaultStatus.ACTIVE,
        },
      });

      const nextLockedReward = await tx.rewardClaim.findFirst({
        where: { vaultId, status: 'LOCKED' },
        orderBy: { weekNumber: 'asc' },
      });

      if (nextLockedReward) {
        await tx.rewardClaim.update({
          where: { id: nextLockedReward.id },
          data: { status: 'AVAILABLE' },
        });
      }
    });
  }
}
