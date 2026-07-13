import { VaultStatus, decimalToNumber } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import {
  buildAccountExplorerUrl,
  getHorizonServer,
  getTreasuryKeypair,
  getVaultAsset,
  getStellarNetwork,
  isStellarEnabled,
} from '@/lib/stellar-config';
import type { PublicStatsView, TransparencyView } from '@/types/transparency';

export type { PublicStatsView, TransparencyView } from '@/types/transparency';

type ChainBalance = {
  id: string;
  amount: number;
};

type ActiveVaultRow = {
  id: string;
  principal: unknown;
  claimableBalanceId: string | null;
};

async function fetchTreasuryClaimableBalances(): Promise<ChainBalance[]> {
  const server = getHorizonServer();
  const treasury = getTreasuryKeypair().publicKey();
  const asset = getVaultAsset();
  const balances: ChainBalance[] = [];
  let page = await server.claimableBalances().claimant(treasury).asset(asset).limit(200).call();

  while (true) {
    for (const record of page.records) {
      balances.push({
        id: record.id,
        amount: Number(record.amount),
      });
    }

    if (!page.records.length || !page.next) break;
    page = await page.next();
  }

  return balances;
}

export class TransparencyService {
  static async getOverview(): Promise<TransparencyView> {
    const now = new Date().toISOString();
    const networkLabel = getStellarNetwork() === 'PUBLIC' ? 'Stellar mainnet' : 'Stellar testnet';
    const enabled = isStellarEnabled();

    const [activeVaults, confirmedLocks] = await Promise.all([
      prisma.vault.findMany({
        where: { status: VaultStatus.ACTIVE },
        select: { id: true, principal: true, claimableBalanceId: true },
      }) as Promise<ActiveVaultRow[]>,
      prisma.stellarOperation.findMany({
        where: { kind: 'LOCK', state: 'CONFIRMED' },
        select: { vaultId: true, claimableBalanceId: true, amount: true },
      }),
    ]);

    const lockedPrincipal = activeVaults.reduce(
      (sum: number, vault: ActiveVaultRow) => sum + decimalToNumber(vault.principal),
      0,
    );
    const verifiedLocks = confirmedLocks.length;

    if (!enabled) {
      return {
        enabled: false,
        networkLabel,
        treasuryAccountId: null,
        treasuryExplorerUrl: null,
        assetCode: null,
        lastCheckedAt: now,
        db: {
          activeVaults: activeVaults.length,
          lockedPrincipal,
          verifiedLocks,
        },
        chain: null,
        reconciliation: {
          status: 'unavailable',
          message: 'On-chain verification is not configured in this environment.',
          unmatchedDbVaults: 0,
          unmatchedChainBalances: 0,
        },
      };
    }

    const treasuryAccountId = getTreasuryKeypair().publicKey();
    const assetCode = process.env.STELLAR_ASSET_CODE?.trim() || 'PHPC';

    let chainBalances: ChainBalance[] = [];
    try {
      chainBalances = await fetchTreasuryClaimableBalances();
    } catch {
      return {
        enabled: true,
        networkLabel,
        treasuryAccountId,
        treasuryExplorerUrl: buildAccountExplorerUrl(treasuryAccountId),
        assetCode,
        lastCheckedAt: now,
        db: {
          activeVaults: activeVaults.length,
          lockedPrincipal,
          verifiedLocks,
        },
        chain: null,
        reconciliation: {
          status: 'unavailable',
          message: 'Could not reach the Stellar network. Try again shortly.',
          unmatchedDbVaults: 0,
          unmatchedChainBalances: 0,
        },
      };
    }

    const chainById = new Map(chainBalances.map((balance) => [balance.id, balance.amount]));
    const chainLockedPrincipal = chainBalances.reduce((sum, balance) => sum + balance.amount, 0);

    const activeWithChainId = activeVaults.filter((vault: ActiveVaultRow) => vault.claimableBalanceId);
    const unmatchedDbVaults = activeWithChainId.filter(
      (vault: ActiveVaultRow) => vault.claimableBalanceId && !chainById.has(vault.claimableBalanceId),
    ).length;

    const dbChainIds = new Set(
      activeVaults
        .map((vault: ActiveVaultRow) => vault.claimableBalanceId)
        .filter((id: string | null): id is string => Boolean(id)),
    );
    const unmatchedChainBalances = chainBalances.filter((balance) => !dbChainIds.has(balance.id)).length;

    let status: TransparencyView['reconciliation']['status'] = 'matched';
    let message = 'Active vault locks match on-chain claimable balances.';

    if (verifiedLocks < activeVaults.length) {
      status = 'pending';
      message = `${activeVaults.length - verifiedLocks} active vault${activeVaults.length - verifiedLocks === 1 ? '' : 's'} still settling on-chain.`;
    } else if (unmatchedDbVaults > 0 || unmatchedChainBalances > 0) {
      status = 'mismatch';
      message = 'A reconciliation review is needed — contact support if this persists.';
    }

    return {
      enabled: true,
      networkLabel,
      treasuryAccountId,
      treasuryExplorerUrl: buildAccountExplorerUrl(treasuryAccountId),
      assetCode,
      lastCheckedAt: now,
      db: {
        activeVaults: activeVaults.length,
        lockedPrincipal,
        verifiedLocks,
      },
      chain: {
        claimableBalances: chainBalances.length,
        lockedPrincipal: chainLockedPrincipal,
      },
      reconciliation: {
        status,
        message,
        unmatchedDbVaults,
        unmatchedChainBalances,
      },
    };
  }

  static async getPublicStats(): Promise<PublicStatsView> {
    const overview = await this.getOverview();
    return {
      activeVaults: overview.db.activeVaults,
      lockedPrincipal: overview.db.lockedPrincipal,
      verifiedOnChain: overview.db.verifiedLocks,
      stellarEnabled: overview.enabled,
      networkLabel: overview.networkLabel,
    };
  }
}
