import { VaultStatus, decimalToNumber } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import {
  buildAccountExplorerUrl,
  getStellarNetwork,
  getTreasuryPublicKey,
  isStellarEnabled,
} from '@/lib/stellar-config';
import { StellarService } from '@/services/stellar-service';
import type { ReservesView } from '@/types/vault';
import type { Prisma } from '@prisma/client';

type ActiveVaultRow = Prisma.VaultGetPayload<{
  select: {
    goalName: true;
    principal: true;
    maturesAt: true;
    verificationToken: true;
    claimableBalanceId: true;
    stellarOperations: {
      select: { state: true };
    };
  };
}>;

export class ReservesService {
  static async getPublicOverview(): Promise<ReservesView> {
    const stellarEnabled = isStellarEnabled();
    const networkLabel = getStellarNetwork() === 'PUBLIC' ? 'Stellar mainnet' : 'Stellar testnet';
    const treasuryPublicKey = getTreasuryPublicKey();

    const [activeVaults, onChainLocks] = await Promise.all([
      prisma.vault.findMany({
        where: { status: VaultStatus.ACTIVE },
        select: {
          goalName: true,
          principal: true,
          maturesAt: true,
          verificationToken: true,
          claimableBalanceId: true,
          stellarOperations: {
            where: { kind: 'LOCK' },
            select: { state: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      stellarEnabled
        ? prisma.stellarOperation.findMany({
            where: { kind: 'LOCK', state: 'CONFIRMED' },
            select: { amount: true },
          })
        : Promise.resolve([]),
    ]);

    const totalLocked = activeVaults.reduce(
      (sum: number, vault: ActiveVaultRow) => sum + decimalToNumber(vault.principal),
      0,
    );

    const onChainLockedTotal = onChainLocks.reduce(
      (sum: number, op: { amount: Prisma.Decimal }) => sum + decimalToNumber(op.amount),
      0,
    );

    return {
      stellarEnabled,
      networkLabel,
      treasuryExplorerUrl: treasuryPublicKey ? buildAccountExplorerUrl(treasuryPublicKey) : null,
      totalLocked,
      activeVaultCount: activeVaults.length,
      onChainConfirmedCount: onChainLocks.length,
      onChainLockedTotal,
      vaults: activeVaults.map((vault: ActiveVaultRow) => {
        const lockOp = vault.stellarOperations[0];
        const stellarRecord = {
          claimableBalanceId: vault.claimableBalanceId,
          stellarOperations: lockOp ? [{ kind: 'LOCK', state: lockOp.state, txHash: null }] : [],
        };

        const stellarView = StellarService.toStellarView(stellarRecord);

        return {
          goalName: vault.goalName,
          principal: decimalToNumber(vault.principal),
          maturesAt: vault.maturesAt.toISOString(),
          stellarStatus: stellarView?.status ?? null,
          verifyPath: `/verify/${vault.verificationToken}`,
        };
      }),
    };
  }
}
