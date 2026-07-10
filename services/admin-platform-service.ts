import { AppUserStatus, AppUserVerificationStatus, PointsTransactionType, VaultStatus, decimalToNumber } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import { buildTransactionExplorerUrl, getHorizonUrl, getStellarNetwork, isStellarEnabled } from '@/lib/stellar-config';
import { PointsService } from '@/services/points-service';
import { VaultService } from '@/services/vault-service';
import { AdminAuditService } from '@/services/admin-audit-service';
import type { NextApiRequest } from 'next';

const PAGE_SIZE = 50;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sinceDays(days: number) {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days + 1);
  return date;
}

export class AdminPlatformService {
  static async analytics() {
    const since = sinceDays(30);
    const [
      totalUsers,
      registrationRows,
      activeUsers,
      activeVaults,
      allVaults,
      locked,
      pointsIssued,
      pointsRedeemed,
      stellarOps,
      failedOps,
    ] = await Promise.all([
      prisma.appUser.count(),
      prisma.$queryRaw<Array<{ day: Date; count: number }>>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
        FROM "AppUser"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
      `,
      prisma.appUser.count({ where: { OR: [{ lastSeenAt: { gte: since } }, { updatedAt: { gte: since } }] } }),
      prisma.vault.count({ where: { status: VaultStatus.ACTIVE } }),
      prisma.vault.count(),
      prisma.vault.aggregate({ where: { status: VaultStatus.ACTIVE }, _sum: { principal: true } }),
      prisma.pointsTransaction.aggregate({ where: { points: { gt: 0 } }, _sum: { points: true } }),
      prisma.pointsTransaction.aggregate({ where: { points: { lt: 0 } }, _sum: { points: true } }),
      prisma.stellarOperation.count(),
      prisma.stellarOperation.count({ where: { state: 'FAILED' } }),
    ]);

    const registrationsByDay = new Map(
      registrationRows.map((row: { day: Date; count: number }) => [startOfDay(row.day).toISOString().slice(0, 10), row.count]),
    );

    const userGrowth = Array.from({ length: 30 }, (_, index) => {
      const day = startOfDay(since);
      day.setDate(day.getDate() + index);
      const key = day.toISOString().slice(0, 10);
      return {
        date: key,
        registrations: registrationsByDay.get(key) ?? 0,
      };
    });

    return {
      metrics: {
        totalUsers,
        activeUsers,
        activeVaults,
        allVaults,
        lockedBalance: decimalToNumber(locked._sum.principal ?? 0),
        pointsIssued: pointsIssued._sum.points ?? 0,
        pointsRedeemed: Math.abs(pointsRedeemed._sum.points ?? 0),
        stellarOps,
        failedOps,
      },
      userGrowth,
      environment: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        vercelEnv: process.env.VERCEL_ENV ?? null,
        stellarNetwork: getStellarNetwork(),
        stellarEnabled: isStellarEnabled(),
        horizonUrl: getHorizonUrl(),
      },
    };
  }

  static async listUsers(query: { q?: string; status?: string; page?: number }) {
    const page = Math.max(1, query.page ?? 1);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { email: { contains: query.q, mode: 'insensitive' } },
        { displayName: { contains: query.q, mode: 'insensitive' } },
        { clerkUserId: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.appUser.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          vaults: { where: { status: VaultStatus.ACTIVE }, select: { principal: true } },
        },
      }),
      prisma.appUser.count({ where }),
    ]);

    const userIds = users.map((user: { id: string }) => user.id);
    const pointTotals = userIds.length
      ? await prisma.pointsTransaction.groupBy({
          by: ['appUserId'],
          where: { appUserId: { in: userIds } },
          _sum: { points: true },
        })
      : [];
    const pointsByUser = new Map(
      pointTotals.map((row: { appUserId: string; _sum: { points: number | null } }) => [row.appUserId, row._sum.points ?? 0]),
    );

    return {
      users: users.map((user: any) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt.toISOString(),
        lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
        lockedBalance: user.vaults.reduce((sum: number, vault: any) => sum + decimalToNumber(vault.principal), 0),
        pointsBalance: pointsByUser.get(user.id) ?? 0,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    };
  }

  static async getUserDetail(id: string) {
    const user = await prisma.appUser.findUnique({
      where: { id },
      include: {
        vaults: {
          include: {
            stellarOperations: { orderBy: { createdAt: 'desc' } },
            pointsTransactions: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        pointsTransactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!user) throw new Error('User not found.');

    await VaultService.syncVaults(user.id);
    const [pointsBalance, lockedBalance] = await Promise.all([
      PointsService.getBalance(user.id),
      VaultService.getLockedBalance(user.id),
    ]);

    return {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
      pointsBalance,
      lockedBalance,
      vaults: user.vaults.map((vault: any) => ({
        id: vault.id,
        principal: decimalToNumber(vault.principal),
        lockMonths: vault.lockMonths,
        status: vault.status,
        startAt: vault.startAt.toISOString(),
        maturesAt: vault.maturesAt.toISOString(),
        claimableBalanceId: vault.claimableBalanceId,
        stellarOperations: vault.stellarOperations.map(toStellarOperationView),
      })),
      pointsTransactions: user.pointsTransactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        points: tx.points,
        description: tx.description,
        rewardName: tx.rewardName,
        voucherCode: tx.voucherCode,
        createdAt: tx.createdAt.toISOString(),
      })),
    };
  }

  static async adjustPoints(input: {
    adminUserId: string;
    appUserId: string;
    points: number;
    reason: string;
    req?: NextApiRequest;
  }) {
    if (!Number.isInteger(input.points) || input.points === 0) throw new Error('Point adjustment must be a non-zero integer.');
    if (!input.reason.trim()) throw new Error('A reason is required.');

    const result = await prisma.$transaction(async (tx: any) => {
      await tx.$queryRaw`SELECT id FROM "AppUser" WHERE id = ${input.appUserId} FOR UPDATE`;
      const user = await tx.appUser.findUnique({ where: { id: input.appUserId } });
      if (!user) throw new Error('User not found.');
      const balanceResult = await tx.pointsTransaction.aggregate({
        where: { appUserId: input.appUserId },
        _sum: { points: true },
      });
      const balance = balanceResult._sum.points ?? 0;
      if (balance + input.points < 0) throw new Error('This deduction would make the user balance negative.');

      const txRow = await tx.pointsTransaction.create({
        data: {
          appUserId: input.appUserId,
          type: PointsTransactionType.ADMIN_ADJUSTMENT,
          points: input.points,
          description: `Admin adjustment: ${input.reason.trim()}`,
        },
      });
      return { user, transaction: txRow, balanceBefore: balance, balanceAfter: balance + input.points };
    });

    await AdminAuditService.record({
      adminUserId: input.adminUserId,
      action: 'POINTS_ADJUSTED',
      targetType: 'AppUser',
      targetId: input.appUserId,
      reason: input.reason,
      metadata: {
        points: input.points,
        balanceBefore: result.balanceBefore,
        balanceAfter: result.balanceAfter,
        transactionId: result.transaction.id,
      },
      req: input.req,
    });

    return result;
  }

  static async updateAppUser(input: {
    adminUserId: string;
    appUserId: string;
    status?: string;
    verificationStatus?: string;
    req?: NextApiRequest;
  }) {
    const user = await prisma.appUser.findUnique({ where: { id: input.appUserId } });
    if (!user) throw new Error('User not found.');

    const data: Record<string, string> = {};
    if (input.status !== undefined) {
      if (!Object.values(AppUserStatus).includes(input.status as (typeof AppUserStatus)[keyof typeof AppUserStatus])) {
        throw new Error('Invalid user status.');
      }
      data.status = input.status;
    }
    if (input.verificationStatus !== undefined) {
      if (!Object.values(AppUserVerificationStatus).includes(input.verificationStatus as (typeof AppUserVerificationStatus)[keyof typeof AppUserVerificationStatus])) {
        throw new Error('Invalid verification status.');
      }
      data.verificationStatus = input.verificationStatus;
    }
    if (Object.keys(data).length === 0) throw new Error('No updates provided.');

    const updated = await prisma.appUser.update({ where: { id: input.appUserId }, data });

    await AdminAuditService.record({
      adminUserId: input.adminUserId,
      action: 'USER_STATUS_UPDATED',
      targetType: 'AppUser',
      targetId: input.appUserId,
      metadata: { ...data, email: updated.email },
      req: input.req,
    });

    return updated;
  }

  static async listPointsHistory(query: { page?: number; q?: string; type?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const where: Record<string, unknown> = {};
    if (query.type) where.type = query.type;
    if (query.q) {
      where.appUser = {
        OR: [
          { email: { contains: query.q, mode: 'insensitive' } },
          { displayName: { contains: query.q, mode: 'insensitive' } },
        ],
      };
    }

    const [rows, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where,
        include: { appUser: { select: { email: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.pointsTransaction.count({ where }),
    ]);

    return {
      transactions: rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        points: row.points,
        description: row.description,
        userEmail: row.appUser.email,
        userDisplayName: row.appUser.displayName,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    };
  }

  static async listOnChainOperations(query: { page?: number; state?: string; kind?: string; q?: string } = {}) {
    const page = Math.max(1, query.page ?? 1);
    const where: Record<string, unknown> = {};
    if (query.state) where.state = query.state;
    if (query.kind) where.kind = query.kind;
    if (query.q) {
      where.vault = {
        appUser: {
          OR: [
            { email: { contains: query.q, mode: 'insensitive' } },
            { displayName: { contains: query.q, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [rows, total] = await Promise.all([
      prisma.stellarOperation.findMany({
        where,
        include: { vault: { include: { appUser: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.stellarOperation.count({ where }),
    ]);

    return {
      health: {
        stellarEnabled: isStellarEnabled(),
        network: getStellarNetwork(),
        horizonUrl: getHorizonUrl(),
      },
      operations: rows.map(toStellarOperationView),
      total,
      page,
      pageSize: PAGE_SIZE,
    };
  }

  static async listAuditLogs(query: {
    page?: number;
    action?: string;
    adminUserId?: string;
    from?: string;
    to?: string;
  } = {}) {
    const page = Math.max(1, query.page ?? 1);
    const where: Record<string, unknown> = {};
    if (query.action) where.action = query.action;
    if (query.adminUserId) where.adminUserId = query.adminUserId;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        include: { adminUser: { select: { email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log: any) => ({
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        reason: log.reason,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        adminEmail: log.adminUser?.email ?? null,
        adminUserId: log.adminUserId,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    };
  }

  static async bulkAdjustPoints(input: {
    adminUserId: string;
    emails: string[];
    points: number;
    reason: string;
    req?: NextApiRequest;
  }) {
    const uniqueEmails = Array.from(new Set(input.emails.map((email) => email.trim().toLowerCase()).filter(Boolean)));
    if (uniqueEmails.length === 0) throw new Error('At least one email is required.');
    const users = await prisma.appUser.findMany({ where: { email: { in: uniqueEmails } } });
    const found = new Set(users.map((user: any) => user.email?.toLowerCase()));
    const missing = uniqueEmails.filter((email) => !found.has(email));
    const adjusted = [];

    for (const user of users) {
      adjusted.push(await this.adjustPoints({
        adminUserId: input.adminUserId,
        appUserId: user.id,
        points: input.points,
        reason: input.reason,
        req: input.req,
      }));
    }

    await AdminAuditService.record({
      adminUserId: input.adminUserId,
      action: 'POINTS_BULK_ADJUSTED',
      targetType: 'PointsTransaction',
      reason: input.reason,
      metadata: { requested: uniqueEmails.length, adjusted: adjusted.length, missing, points: input.points },
      req: input.req,
    });

    return { adjusted: adjusted.length, missing };
  }
}

function toStellarOperationView(row: any) {
  return {
    id: row.id,
    vaultId: row.vaultId,
    userEmail: row.vault?.appUser?.email ?? null,
    kind: row.kind,
    state: row.state,
    amount: decimalToNumber(row.amount),
    claimableBalanceId: row.claimableBalanceId,
    txHash: row.txHash,
    explorerUrl: row.txHash ? buildTransactionExplorerUrl(row.txHash) : null,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
