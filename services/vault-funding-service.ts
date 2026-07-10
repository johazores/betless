import { ActivityEventType, ActivityRail, ActivityStatus } from '@/lib/domain';
import { buildStellarAccountExplorerUrl } from '@/lib/stellar-explorer';
import { prisma } from '@/lib/prisma';
import { ActivityEventService } from '@/services/activity-event-service';
import { ConfigService } from '@/services/config-service';
import { StellarService, StellarServiceError } from '@/services/stellar-service';
import { buildVaultAccessWhere, type VaultAccess } from '@/services/vault-access-service';
import { VaultService } from '@/services/vault-service';

type FundingVault = {
  id: string;
  appUserId: string | null;
  walletAddress: string;
  stellarFundedAt: Date | null;
};

export class VaultFundingService {
  private static async loadVault(vaultId: string, access: VaultAccess): Promise<FundingVault> {
    const vault = await prisma.vault.findFirst({ where: buildVaultAccessWhere(vaultId, access) });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    return vault as FundingVault;
  }

  /**
   * Reads the real on-chain balance from Horizon and caches it on the vault.
   * Never funds; used for read-only balance refreshes.
   */
  static async syncBalance(vaultId: string, access: VaultAccess) {
    const vault = await this.loadVault(vaultId, access);
    const account = await StellarService.getAccount(vault.walletAddress);

    await prisma.vault.update({
      where: { id: vault.id },
      data: {
        stellarNativeBalance: account ? account.nativeBalance : null,
        stellarBalanceSyncedAt: new Date(),
        stellarFundedAt: account && !vault.stellarFundedAt ? new Date() : vault.stellarFundedAt,
      },
    });

    return VaultService.getVaultDetail(vaultId, access);
  }

  /**
   * Ensures the vault wallet exists on-ledger (funding it via Friendbot on
   * testnet when needed), caches the confirmed balance, and records a real
   * funding activity event the first time the account becomes active.
   */
  static async activateAndFund(vaultId: string, access: VaultAccess) {
    const vault = await this.loadVault(vaultId, access);

    try {
      const account = await StellarService.ensureAccountFunded(vault.walletAddress);
      const networkLabel = ConfigService.getStellarNetworkLabel();
      const isFirstFunding = !vault.stellarFundedAt;

      await prisma.$transaction(async (tx: any) => {
        await tx.vault.update({
          where: { id: vault.id },
          data: {
            stellarNativeBalance: account.nativeBalance,
            stellarBalanceSyncedAt: new Date(),
            stellarFundedAt: vault.stellarFundedAt ?? new Date(),
            stellarError: null,
          },
        });

        if (isFirstFunding) {
          await ActivityEventService.create(tx, {
            appUserId: vault.appUserId,
            vaultId: vault.id,
            type: ActivityEventType.STELLAR_ACCOUNT_FUNDED,
            rail: ActivityRail.STELLAR,
            status: ActivityStatus.COMPLETED,
            title: 'Stellar account activated',
            description: `Wallet activated on ${networkLabel} with ${account.nativeBalance} XLM.`,
            walletAddress: vault.walletAddress,
            destinationAccount: vault.walletAddress,
            network: networkLabel,
            amount: Number(account.nativeBalance),
            assetCode: 'XLM',
            reference: vault.walletAddress,
            accountExplorerUrl: buildStellarAccountExplorerUrl(vault.walletAddress, ConfigService.getStellarNetwork()),
            explorerUrl: buildStellarAccountExplorerUrl(vault.walletAddress, ConfigService.getStellarNetwork()),
          });
        }
      });

      return VaultService.getVaultDetail(vaultId, access);
    } catch (error) {
      const message = error instanceof StellarServiceError ? error.message : 'Stellar account funding failed.';
      await prisma.vault.update({
        where: { id: vault.id },
        data: { stellarError: message },
      });
      throw error;
    }
  }
}
