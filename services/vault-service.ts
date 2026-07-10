import { ActivityEventType, ActivityRail, ActivityStatus, VaultMode, decimalToNumber } from '@/lib/domain';
import { addWeeks } from '@/lib/dates';
import { getPlannedTopUpCount } from '@/lib/planning';
import { prisma } from '@/lib/prisma';
import type { CreateVaultInput } from '@/lib/validators';
import { ConfigService } from '@/services/config-service';
import { buildVaultAccessWhere, type VaultAccess } from '@/services/vault-access-service';
import { ActivityEventService } from '@/services/activity-event-service';
import { RewardService } from '@/services/reward-service';
import { TopUpService } from '@/services/top-up-service';
import { UserService } from '@/services/user-service';
import type { DashboardVaultView, ProofReceiptView, RewardClaimView, TopUpView, VaultDetailView } from '@/types/vault';

type TopUpRecord = {
  id: string;
  amount: unknown;
  dueAt: Date;
  paidAt: Date | null;
  status: TopUpView['status'];
};

type RewardClaimRecord = {
  id: string;
  weekNumber: number;
  rewardName: string;
  rewardValue: unknown;
  voucherCode: string | null;
  status: RewardClaimView['status'];
  claimedAt: Date | null;
};

type ProofReceiptRecord = {
  id: string;
  vaultId: string;
  status: ProofReceiptView['status'];
  network: string;
  publicAddress: string;
  sourceAccount: string | null;
  destinationAccount: string | null;
  proofReference: string;
  transactionHash: string | null;
  operationId: string | null;
  ledger: number | null;
  memo: string | null;
  explorerUrl: string | null;
  accountExplorerUrl: string | null;
  message: string;
  createdAt: Date;
};

type VaultWithRelations = {
  id: string;
  appUserId: string | null;
  guestAccessTokenHash: string | null;
  walletAddress: string;
  displayName: string | null;
  mode: VaultDetailView['mode'];
  targetAmount: unknown;
  currentAmount: unknown;
  topUpAmount: unknown | null;
  topUpFrequency: VaultDetailView['topUpFrequency'];
  durationWeeks: number;
  rewardType: string;
  rewardRate: unknown;
  reason: string | null;
  status: VaultDetailView['status'];
  stellarBalanceId: string | null;
  stellarStatus: VaultDetailView['stellarStatus'];
  unlockAt: Date;
  createdAt: Date;
  updatedAt: Date;
  topUps: TopUpRecord[];
  rewards: RewardClaimRecord[];
  receipts: ProofReceiptRecord[];
};

export class VaultService {
  static calculateDurationWeeks(durationMonths: number) {
    return Math.max(1, Math.round(durationMonths * 4));
  }

  static calculateUnlockDate(durationWeeks: number) {
    return addWeeks(new Date(), durationWeeks);
  }

  static async createVault(input: CreateVaultInput, access: VaultAccess) {
    const appUser = access.clerkUserId ? await UserService.ensureAppUser({ clerkUserId: access.clerkUserId }) : null;

    if (!appUser && !access.vaultAccessTokenHash) {
      throw new Error('Create an account or keep this browser open to save the vault.');
    }
    const rewardRate = ConfigService.getRewardRate();
    const durationWeeks = this.calculateDurationWeeks(input.durationMonths);
    const rewardValue = RewardService.calculateRewardValue(input.targetAmount, rewardRate);
    const unlockAt = this.calculateUnlockDate(durationWeeks);
    const plannedTopUpCount = input.mode === VaultMode.PERIODIC_TOP_UP && input.topUpAmount && input.topUpFrequency
      ? getPlannedTopUpCount({
          targetAmount: input.targetAmount,
          currentAmount: input.currentAmount,
          topUpAmount: input.topUpAmount,
          durationWeeks,
          frequency: input.topUpFrequency,
        })
      : 0;
    const rewardMilestoneCount = input.mode === VaultMode.PERIODIC_TOP_UP ? Math.max(1, plannedTopUpCount) : 1;

    const vault = await prisma.$transaction(async (tx: any) => {
      const createdVault = await tx.vault.create({
        data: {
          appUserId: appUser?.id ?? null,
          guestAccessTokenHash: appUser ? null : access.vaultAccessTokenHash,
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

      await ActivityEventService.create(tx, {
        appUserId: appUser?.id ?? null,
        vaultId: createdVault.id,
        type: ActivityEventType.VAULT_CREATED,
        rail: ActivityRail.APP,
        status: ActivityStatus.COMPLETED,
        title: 'Vault created',
        description: ActivityEventService.buildVaultCreatedDescription(input.currentAmount, input.targetAmount),
        walletAddress: input.walletAddress,
        amount: input.currentAmount,
        assetCode: 'PHP',
        reference: createdVault.id,
        metadata: { mode: input.mode, targetAmount: input.targetAmount },
      });

      if (input.mode === VaultMode.PERIODIC_TOP_UP && input.topUpAmount && input.topUpFrequency) {
        await TopUpService.createTopUpSchedule(tx, {
          vaultId: createdVault.id,
          amount: input.topUpAmount,
          durationWeeks,
          frequency: input.topUpFrequency,
          count: plannedTopUpCount,
        });
      }

      await RewardService.createWeeklyRewards(tx, {
        vaultId: createdVault.id,
        durationWeeks: rewardMilestoneCount,
        rewardName: input.rewardType,
        rewardValue,
        makeFirstAvailable: input.mode === VaultMode.ONE_TIME_LOCK && input.currentAmount >= input.targetAmount,
      });

      return createdVault;
    });

    return this.getVaultDetail(vault.id, access);
  }

  static async listVaults(accessOrClerkUserId: VaultAccess | string): Promise<DashboardVaultView[]> {
    const access: VaultAccess = typeof accessOrClerkUserId === 'string'
      ? { clerkUserId: accessOrClerkUserId }
      : accessOrClerkUserId;

    const conditions: Array<Record<string, unknown>> = [];

    if (access.clerkUserId) {
      conditions.push({ appUser: { clerkUserId: access.clerkUserId } });
    }

    if (access.vaultAccessTokenHash) {
      conditions.push({ guestAccessTokenHash: access.vaultAccessTokenHash });
    }

    if (conditions.length === 0) return [];

    const vaults = await prisma.vault.findMany({
      where: { OR: conditions },
      include: { receipts: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });

    return vaults.map((vault: VaultWithRelations) => {
      const currentAmount = decimalToNumber(vault.currentAmount);
      const targetAmount = decimalToNumber(vault.targetAmount);
      const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

      return {
        id: vault.id,
        status: vault.status,
        mode: vault.mode,
        targetAmount,
        currentAmount,
        progressPercent,
        rewardType: vault.rewardType,
        unlockAt: vault.unlockAt.toISOString(),
        createdAt: vault.createdAt.toISOString(),
        stellarStatus: vault.stellarStatus,
        latestReceipt: vault.receipts?.[0] ? this.toProofReceiptView(vault.receipts[0]) : null,
      };
    });
  }

  static async getVaultDetail(id: string, access: VaultAccess) {
    const vault = await prisma.vault.findFirst({
      where: buildVaultAccessWhere(id, access),
      include: {
        topUps: { orderBy: { dueAt: 'asc' } },
        rewards: { orderBy: { weekNumber: 'asc' } },
        receipts: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    return this.toVaultDetailView(vault);
  }

  static async refreshVaultDetail(id: string, access: VaultAccess) {
    return this.getVaultDetail(id, access);
  }

  static async connectVaultToUser(id: string, clerkUserId: string, vaultAccessTokenHash?: string | null) {
    const appUser = await UserService.ensureAppUser({ clerkUserId });

    const vault = await prisma.vault.findFirst({
      where: {
        id,
        OR: [
          { appUser: { clerkUserId } },
          ...(vaultAccessTokenHash ? [{ guestAccessTokenHash: vaultAccessTokenHash }] : []),
        ],
      },
    });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.vault.update({
        where: { id },
        data: { appUserId: appUser.id, guestAccessTokenHash: null },
      });

      await tx.proofReceipt.updateMany({
        where: { vaultId: id },
        data: { appUserId: appUser.id },
      });

      await tx.activityEvent.updateMany({
        where: { vaultId: id },
        data: { appUserId: appUser.id },
      });

      await ActivityEventService.create(tx, {
        appUserId: appUser.id,
        vaultId: id,
        type: ActivityEventType.ACCOUNT_CONNECTED,
        rail: ActivityRail.APP,
        status: ActivityStatus.COMPLETED,
        title: 'Account connected',
        description: 'Vault history is now saved to your account.',
        reference: id,
      });
    });

    return this.getVaultDetail(id, { clerkUserId });
  }


  static async connectGuestSessionToUser(clerkUserId: string, vaultAccessTokenHash?: string | null) {
    if (!vaultAccessTokenHash) {
      return { connectedVaults: 0, connectedReceipts: 0 };
    }

    const appUser = await UserService.ensureAppUser({ clerkUserId });

    const guestVaults = await prisma.vault.findMany({
      where: { guestAccessTokenHash: vaultAccessTokenHash },
      select: { id: true },
    });

    if (guestVaults.length === 0) {
      return { connectedVaults: 0, connectedReceipts: 0 };
    }

    const vaultIds = guestVaults.map((vault: { id: string }) => vault.id);

    const result = await prisma.$transaction(async (tx: any) => {
      const vaultUpdate = await tx.vault.updateMany({
        where: { id: { in: vaultIds } },
        data: { appUserId: appUser.id, guestAccessTokenHash: null },
      });

      const receiptUpdate = await tx.proofReceipt.updateMany({
        where: { vaultId: { in: vaultIds } },
        data: { appUserId: appUser.id },
      });

      await tx.activityEvent.updateMany({
        where: { vaultId: { in: vaultIds } },
        data: { appUserId: appUser.id },
      });

      for (const vaultId of vaultIds) {
        await ActivityEventService.create(tx, {
          appUserId: appUser.id,
          vaultId,
          type: ActivityEventType.ACCOUNT_CONNECTED,
          rail: ActivityRail.APP,
          status: ActivityStatus.COMPLETED,
          title: 'Account connected',
          description: 'Vault history is now saved to your account.',
          reference: vaultId,
        });
      }

      return { connectedVaults: vaultUpdate.count, connectedReceipts: receiptUpdate.count };
    });

    return result;
  }

  private static toTopUpView(topUp: VaultWithRelations['topUps'][number]): TopUpView {
    return {
      id: topUp.id,
      amount: decimalToNumber(topUp.amount),
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
      rewardValue: decimalToNumber(reward.rewardValue),
      voucherCode: reward.voucherCode,
      status: reward.status,
      claimedAt: reward.claimedAt ? reward.claimedAt.toISOString() : null,
    };
  }

  private static toProofReceiptView(receipt: VaultWithRelations['receipts'][number]): ProofReceiptView {
    return {
      id: receipt.id,
      vaultId: receipt.vaultId,
      status: receipt.status,
      network: receipt.network,
      publicAddress: receipt.publicAddress,
      sourceAccount: receipt.sourceAccount ?? null,
      destinationAccount: receipt.destinationAccount ?? null,
      proofReference: receipt.proofReference,
      transactionHash: receipt.transactionHash,
      operationId: receipt.operationId,
      ledger: receipt.ledger,
      memo: receipt.memo,
      explorerUrl: receipt.explorerUrl,
      accountExplorerUrl: receipt.accountExplorerUrl ?? null,
      message: receipt.message,
      createdAt: receipt.createdAt.toISOString(),
    };
  }

  private static toVaultDetailView(vault: VaultWithRelations): VaultDetailView {
    const currentAmount = decimalToNumber(vault.currentAmount);
    const targetAmount = decimalToNumber(vault.targetAmount);
    const progressPercent = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
    const topUps = vault.topUps.map((topUp) => this.toTopUpView(topUp));
    const rewards = vault.rewards.map((reward) => this.toRewardClaimView(reward));
    const receipts = vault.receipts.map((receipt) => this.toProofReceiptView(receipt));
    const goalReached = currentAmount >= targetAmount;

    return {
      id: vault.id,
      walletAddress: vault.walletAddress,
      displayName: vault.displayName,
      mode: vault.mode,
      targetAmount,
      currentAmount,
      topUpAmount: vault.topUpAmount ? decimalToNumber(vault.topUpAmount) : null,
      topUpFrequency: vault.topUpFrequency,
      durationWeeks: vault.durationWeeks,
      rewardType: vault.rewardType,
      rewardRate: decimalToNumber(vault.rewardRate),
      reason: vault.reason,
      status: vault.status,
      stellarBalanceId: vault.stellarBalanceId,
      stellarStatus: vault.stellarStatus,
      unlockAt: vault.unlockAt.toISOString(),
      createdAt: vault.createdAt.toISOString(),
      updatedAt: vault.updatedAt.toISOString(),
      progressPercent: Math.min(100, progressPercent),
      nextTopUp: goalReached ? null : topUps.find((topUp) => topUp.status === 'PENDING') ?? null,
      availableReward: rewards.find((reward) => reward.status === 'AVAILABLE') ?? null,
      topUps,
      rewards,
      receipts,
      latestReceipt: receipts[0] ?? null,
    };
  }
}
