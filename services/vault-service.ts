import { addMonths, fullMonthsBetween } from '@/lib/dates';
import { PointsTransactionType, VaultStatus, decimalToNumber } from '@/lib/domain';
import { formatPeso } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import { calculateEarlyWithdrawalFee, calculateMonthlyPoints, calculateTotalPoints } from '@/lib/vault-rules';
import type { CreateVaultInput } from '@/lib/validators';
import { getPaymentMethodById } from '@/lib/payment-methods';
import { StellarService } from '@/services/stellar-service';
import { UserService } from '@/services/user-service';
import { NotificationService } from '@/services/notification-service';
import type { VaultVerificationView, VaultView } from '@/types/vault';

type VaultRecord = {
  id: string;
  principal: unknown;
  lockMonths: number;
  goalLabel: string | null;
  paymentMethod: string | null;
  status: VaultStatus;
  startAt: Date;
  maturesAt: Date;
  closedAt: Date | null;
  withdrawalFee: unknown | null;
  returnedAmount: unknown | null;
  claimableBalanceId: string | null;
  createdAt: Date;
  pointsTransactions: Array<{ points: number }>;
  stellarOperations: Array<{ kind: string; state: string; txHash: string | null }>;
};

const vaultInclude = {
  pointsTransactions: {
    where: { type: PointsTransactionType.MONTHLY_REWARD },
    select: { points: true },
  },
  stellarOperations: {
    select: { kind: true, state: true, txHash: true },
    orderBy: { createdAt: 'asc' },
  },
} as const;

export class VaultService {
  /**
   * Lazily settles all of a user's vaults before reads:
   * - inserts any monthly reward points that have become due (points start
   *   after the first full month of the lock period);
   * - matures vaults whose lock period has ended, returning the principal
   *   and closing the vault while preserving the points balance.
   *
   * Idempotent: accruals are deduplicated by the unique (vaultId, monthIndex)
   * constraint, and maturity only transitions ACTIVE vaults.
   */
  static async syncVaults(appUserId: string, now = new Date()) {
    const activeVaults = await prisma.vault.findMany({
      where: { appUserId, status: VaultStatus.ACTIVE },
      include: {
        pointsTransactions: {
          where: { type: PointsTransactionType.MONTHLY_REWARD },
          select: { monthIndex: true },
        },
      },
    });

    for (const vault of activeVaults) {
      const principal = decimalToNumber(vault.principal);
      const monthlyPoints = calculateMonthlyPoints(principal);
      const monthsCompleted = Math.min(fullMonthsBetween(vault.startAt, now), vault.lockMonths);
      const accruedMonths = new Set(
        vault.pointsTransactions.map((transaction: { monthIndex: number | null }) => transaction.monthIndex),
      );

      const missingAccruals = [];
      for (let monthIndex = 1; monthIndex <= monthsCompleted; monthIndex += 1) {
        if (!accruedMonths.has(monthIndex)) {
          missingAccruals.push({
            appUserId,
            vaultId: vault.id,
            type: PointsTransactionType.MONTHLY_REWARD,
            points: monthlyPoints,
            monthIndex,
            description: `Month ${monthIndex} of ${vault.lockMonths} reward on your ${formatPeso(principal)} vault`,
          });
        }
      }

      if (missingAccruals.length > 0) {
        await prisma.pointsTransaction.createMany({ data: missingAccruals, skipDuplicates: true });
        const totalPoints = missingAccruals.reduce((sum, row) => sum + row.points, 0);
        NotificationService.notifyPointsEarned(
          appUserId,
          totalPoints,
          `${missingAccruals.length} monthly reward${missingAccruals.length === 1 ? '' : 's'} posted`,
          vault.id,
        );
      }

      if (vault.maturesAt.getTime() <= now.getTime()) {
        const matured = await prisma.vault.updateMany({
          where: { id: vault.id, status: VaultStatus.ACTIVE },
          data: {
            status: VaultStatus.MATURED,
            closedAt: vault.maturesAt,
            returnedAmount: vault.principal,
          },
        });

        // Best-effort on-chain claim; a failure leaves a retryable outbox row.
        if (matured.count > 0) {
          await StellarService.releaseVaultPrincipal(vault, 'CLAIM_MATURITY').catch(() => {});
          NotificationService.notifyVaultMatured(appUserId, vault.id, principal);
        }
      }
    }
  }

  static async createVault(input: CreateVaultInput, clerkUserId: string): Promise<VaultView> {
    const appUser = await UserService.ensureAppUser(clerkUserId);

    if (input.idempotencyKey) {
      const existing = await prisma.vault.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: vaultInclude,
      });
      if (existing && existing.appUserId === appUser.id) {
        return this.toView(existing);
      }
    }

    const startAt = new Date();
    const vault = await prisma.vault.create({
      data: {
        appUserId: appUser.id,
        principal: input.amount,
        lockMonths: input.lockMonths,
        goalLabel: input.goalLabel ?? null,
        paymentMethod: input.paymentMethod ?? null,
        startAt,
        maturesAt: addMonths(startAt, input.lockMonths),
        idempotencyKey: input.idempotencyKey ?? null,
      },
    });

    // Best-effort on-chain lock; a failure leaves a retryable outbox row and
    // never blocks vault creation.
    await StellarService.lockVaultPrincipal(vault).catch(() => {});

    NotificationService.notifyVaultCreated(appUser.id, vault.id, input.amount, input.lockMonths);
    NotificationService.notifyVaultFunded(appUser.id, vault.id, input.amount);

    const refreshed = await prisma.vault.findUniqueOrThrow({
      where: { id: vault.id },
      include: vaultInclude,
    });

    return this.toView(refreshed);
  }

  static async listVaults(clerkUserId: string): Promise<VaultView[]> {
    const appUser = await UserService.ensureAppUser(clerkUserId);
    await this.syncVaults(appUser.id);

    const vaults = await prisma.vault.findMany({
      where: { appUserId: appUser.id },
      include: vaultInclude,
      orderBy: { createdAt: 'desc' },
    });

    return vaults.map((vault: VaultRecord) => this.toView(vault));
  }

  static async getVaultDetail(id: string, clerkUserId: string): Promise<VaultView> {
    const appUser = await UserService.ensureAppUser(clerkUserId);
    await this.syncVaults(appUser.id);
    // Re-drive any unresolved on-chain operations for this vault (lazy outbox sweep).
    await StellarService.processPendingForVault(id).catch(() => {});

    const vault = await prisma.vault.findFirst({
      where: { id, appUserId: appUser.id },
      include: vaultInclude,
    });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    return this.toView(vault);
  }

  /**
   * Early withdrawal: charges the flat/percentage fee, returns the remainder
   * of the principal, and closes the vault. Points already earned are kept.
   */
  static async withdrawEarly(id: string, clerkUserId: string) {
    const appUser = await UserService.ensureAppUser(clerkUserId);
    await this.syncVaults(appUser.id);

    const vault = await prisma.vault.findFirst({ where: { id, appUserId: appUser.id } });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    if (vault.status !== VaultStatus.ACTIVE) {
      throw new Error('This vault is already closed.');
    }

    const principal = decimalToNumber(vault.principal);
    const fee = calculateEarlyWithdrawalFee(principal);
    const returnedAmount = principal - fee;

    // updateMany with a status guard makes concurrent double-withdrawals a no-op.
    const updated = await prisma.vault.updateMany({
      where: { id: vault.id, status: VaultStatus.ACTIVE },
      data: {
        status: VaultStatus.WITHDRAWN_EARLY,
        closedAt: new Date(),
        withdrawalFee: fee,
        returnedAmount,
      },
    });

    if (updated.count === 0) {
      throw new Error('This vault is already closed.');
    }

    // Best-effort on-chain claim + settlement back to the treasury.
    await StellarService.releaseVaultPrincipal(vault, 'CLAIM_EARLY').catch(() => {});

    const refreshed = await prisma.vault.findUniqueOrThrow({
      where: { id: vault.id },
      include: vaultInclude,
    });

    return { vault: this.toView(refreshed), fee, returnedAmount };
  }

  static async getLockedBalance(appUserId: string) {
    const result = await prisma.vault.aggregate({
      where: { appUserId, status: VaultStatus.ACTIVE },
      _sum: { principal: true },
    });

    return decimalToNumber(result._sum.principal ?? 0);
  }

  /**
   * Sweeps all users with active vaults: accrues due points and settles matured vaults.
   * Intended for a scheduled cron in production; reads still trigger the same path lazily.
   */
  static async syncAllVaults(now = new Date()) {
    const activeUsers = await prisma.vault.findMany({
      where: { status: VaultStatus.ACTIVE },
      select: { appUserId: true },
      distinct: ['appUserId'],
    });

    const dueBefore = await prisma.vault.count({
      where: { status: VaultStatus.ACTIVE, maturesAt: { lte: now } },
    });

    for (const { appUserId } of activeUsers) {
      await this.syncVaults(appUserId, now);
    }

    const maturedDuringSweep = await prisma.vault.count({
      where: {
        status: VaultStatus.MATURED,
        closedAt: { gte: new Date(now.getTime() - 60_000) },
      },
    });

    return {
      usersSynced: activeUsers.length,
      vaultsDueBeforeSweep: dueBefore,
      vaultsMaturedDuringSweep: maturedDuringSweep,
    };
  }

  /** Redacted, public verification view for a single vault — no user PII. */
  static async getPublicVerification(vaultId: string): Promise<VaultVerificationView | null> {
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId },
      include: {
        pointsTransactions: {
          where: { type: PointsTransactionType.MONTHLY_REWARD },
          select: { points: true },
        },
        stellarOperations: {
          select: { kind: true, state: true, txHash: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!vault) return null;

    const principal = decimalToNumber(vault.principal);
    const monthsCompleted = Math.min(fullMonthsBetween(vault.startAt, new Date()), vault.lockMonths);
    const progressPercent = Math.min(100, Math.round((monthsCompleted / vault.lockMonths) * 100));

    return {
      id: vault.id,
      principal,
      lockMonths: vault.lockMonths,
      goalLabel: vault.goalLabel,
      status: vault.status,
      maturesAt: vault.maturesAt.toISOString(),
      closedAt: vault.closedAt ? vault.closedAt.toISOString() : null,
      progressPercent,
      monthsCompleted,
      stellar: StellarService.toStellarView(vault),
    };
  }

  private static toView(vault: VaultRecord): VaultView {
    const principal = decimalToNumber(vault.principal);
    const monthlyPoints = calculateMonthlyPoints(principal);
    const pointsEarned = vault.pointsTransactions.reduce((sum, transaction) => sum + transaction.points, 0);
    const monthsCompleted = monthlyPoints > 0 ? Math.round(pointsEarned / monthlyPoints) : 0;

    const paymentMethodName = vault.paymentMethod
      ? getPaymentMethodById(vault.paymentMethod)?.name ?? vault.paymentMethod
      : null;

    return {
      id: vault.id,
      principal,
      lockMonths: vault.lockMonths,
      goalLabel: vault.goalLabel,
      paymentMethod: vault.paymentMethod,
      paymentMethodName,
      status: vault.status,
      startAt: vault.startAt.toISOString(),
      maturesAt: vault.maturesAt.toISOString(),
      closedAt: vault.closedAt ? vault.closedAt.toISOString() : null,
      withdrawalFee: vault.withdrawalFee == null ? null : decimalToNumber(vault.withdrawalFee),
      returnedAmount: vault.returnedAmount == null ? null : decimalToNumber(vault.returnedAmount),
      monthlyPoints,
      monthsCompleted,
      pointsEarned,
      totalPointsAtMaturity: calculateTotalPoints(principal, vault.lockMonths),
      progressPercent: Math.min(100, Math.round((monthsCompleted / vault.lockMonths) * 100)),
      earlyWithdrawalFee: vault.status === VaultStatus.ACTIVE ? calculateEarlyWithdrawalFee(principal) : null,
      stellar: StellarService.toStellarView(vault),
      createdAt: vault.createdAt.toISOString(),
    };
  }
}
