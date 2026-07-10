import { decimalToNumber } from '@/lib/domain';
import {
  buildTransactionExplorerUrl,
  getStellarNetwork,
  isStellarEnabled,
} from '@/lib/stellar-config';
import { prisma } from '@/lib/prisma';
import type { Prisma, StellarOperationState } from '@prisma/client';
import type { OnChainActivityItem, OnChainOverviewView } from '@/types/notifications';

type OperationRow = Prisma.StellarOperationGetPayload<{
  include: { vault: { select: { principal: true } } };
}>;

type LockedVaultRow = { amount: Prisma.Decimal };

const pendingStates: StellarOperationState[] = ['PENDING', 'SUBMITTED'];

export class OnChainOverviewService {
  static async getForUser(appUserId: string): Promise<OnChainOverviewView> {
    const enabled = isStellarEnabled();
    const networkLabel = getStellarNetwork() === 'PUBLIC' ? 'Stellar mainnet' : 'Stellar network';

    if (!enabled) {
      return {
        enabled: false,
        networkLabel,
        status: 'disabled',
        statusMessage: 'On-chain verification is not active in this environment.',
        lockedOnChain: 0,
        pendingOperations: 0,
        failedOperations: 0,
        confirmedLocks: 0,
        recentOperations: [],
      };
    }

    const vaultIds = (await prisma.vault.findMany({
      where: { appUserId },
      select: { id: true },
    })).map((v: { id: string }) => v.id);

    if (vaultIds.length === 0) {
      return {
        enabled: true,
        networkLabel,
        status: 'healthy',
        statusMessage: 'Network operational. Create a vault to see on-chain activity.',
        lockedOnChain: 0,
        pendingOperations: 0,
        failedOperations: 0,
        confirmedLocks: 0,
        recentOperations: [],
      };
    }

    const [operations, lockedVaults] = await Promise.all([
      prisma.stellarOperation.findMany({
        where: { vaultId: { in: vaultIds } },
        include: { vault: { select: { principal: true } } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.stellarOperation.findMany({
        where: { vaultId: { in: vaultIds }, kind: 'LOCK', state: 'CONFIRMED' },
        select: { amount: true },
      }),
    ]);

    const pendingOperations = operations.filter((op: OperationRow) => pendingStates.includes(op.state)).length;
    const failedOperations = operations.filter((op: OperationRow) => op.state === 'FAILED').length;
    const confirmedLocks = lockedVaults.length;
    const lockedOnChain = lockedVaults.reduce((sum: number, op: LockedVaultRow) => sum + decimalToNumber(op.amount), 0);

    let status: OnChainOverviewView['status'] = 'healthy';
    let statusMessage = 'All on-chain operations are up to date.';
    if (failedOperations > 0) {
      status = 'degraded';
      statusMessage = `${failedOperations} transaction${failedOperations === 1 ? '' : 's'} need attention. Your vaults remain secure.`;
    } else if (pendingOperations > 0) {
      status = 'healthy';
      statusMessage = `${pendingOperations} transaction${pendingOperations === 1 ? '' : 's'} processing on the network.`;
    }

    const kindLabels: Record<string, string> = {
      LOCK: 'Deposit lock',
      CLAIM_MATURITY: 'Maturity claim',
      CLAIM_EARLY: 'Early withdrawal',
    };

    const recentOperations: OnChainActivityItem[] = operations.map((op: OperationRow) => ({
      id: op.id,
      kind: op.kind,
      state: op.state,
      vaultId: op.vaultId,
      amount: decimalToNumber(op.amount),
      txHash: op.txHash,
      explorerUrl: op.txHash ? buildTransactionExplorerUrl(op.txHash) : null,
      createdAt: op.createdAt.toISOString(),
      vaultLabel: `${kindLabels[op.kind] ?? op.kind} · ${formatPesoShort(decimalToNumber(op.vault.principal))}`,
    }));

    return {
      enabled: true,
      networkLabel,
      status,
      statusMessage,
      lockedOnChain,
      pendingOperations,
      failedOperations,
      confirmedLocks,
      recentOperations,
    };
  }
}

function formatPesoShort(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
}
