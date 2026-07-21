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

const AMOUNT_TOLERANCE = 0.0000001;

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
        where: {
          kind: 'LOCK',
          state: 'CONFIRMED',
          vault: { status: VaultStatus.ACTIVE },
        },
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
          amountMismatches: 0,
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
          amountMismatches: 0,
        },
      };
    }

    const chainById = new Map(chainBalances.map((balance) => [balance.id, balance.amount]));
    const chainLockedPrincipal = chainBalances.reduce((sum, balance) => sum + balance.amount, 0);

    const activeWithChainId = activeVaults.filter(
      (vault: ActiveVaultRow): vault is ActiveVaultRow & { claimableBalanceId: string } =>
        Boolean(vault.claimableBalanceId),
    );
    const unmatchedDbVaults = activeWithChainId.filter(
      (vault) => !chainById.has(vault.claimableBalanceId),
    ).length;

    const amountMismatches = activeWithChainId.filter((vault) => {
      const chainAmount = chainById.get(vault.claimableBalanceId);
      if (chainAmount === undefined) return false;
      return Math.abs(chainAmount - decimalToNumber(vault.principal)) > AMOUNT_TOLERANCE;
    }).length;

    const dbChainIds = new Set(activeWithChainId.map((vault) => vault.claimableBalanceId));
    const unmatchedChainBalances = chainBalances.filter((balance) => !dbChainIds.has(balance.id)).length;

    let status: TransparencyView['reconciliation']['status'] = 'matched';
    let message = 'Active vault locks match the recorded on-chain balances.';

    if (unmatchedDbVaults > 0 || unmatchedChainBalances > 0 || amountMismatches > 0) {
      status = 'mismatch';
      message = 'A custody mismatch requires review. Pending work does not hide a confirmed mismatch.';
    } else if (verifiedLocks < activeVaults.length) {
      status = 'pending';
      message = `${activeVaults.length - verifiedLocks} active vault${activeVaults.length - verifiedLocks === 1 ? '' : 's'} still settling on-chain.`;
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
        amountMismatches,
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
