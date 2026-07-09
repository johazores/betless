import { StellarStatus } from '@/lib/domain';
import { ConfigService } from '@/services/config-service';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { prisma } from '@/lib/prisma';

export class StellarProofService {
  static validatePublicKey(walletAddress: string) {
    if (!isValidStellarPublicKey(walletAddress)) {
      throw new Error('Invalid Stellar public address.');
    }
  }

  static async createOrSimulateProof(vaultId: string) {
    const vault = await prisma.vault.findUnique({ where: { id: vaultId } });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    this.validatePublicKey(vault.walletAddress);

    await prisma.vault.update({
      where: { id: vaultId },
      data: { stellarStatus: StellarStatus.PENDING },
    });

    try {
      const horizonUrl = ConfigService.getStellarHorizonUrl().replace(/\/$/, '');
      const response = await fetch(`${horizonUrl}/accounts/${vault.walletAddress}`);

      if (!response.ok) {
        throw new Error('Stellar testnet account is not available yet.');
      }

      const account = (await response.json()) as { sequence?: string; last_modified_ledger?: number };
      const proofReference = `testnet-account-${account.last_modified_ledger ?? account.sequence ?? Date.now()}`;

      await prisma.vault.update({
        where: { id: vaultId },
        data: {
          stellarStatus: StellarStatus.CREATED,
          stellarBalanceId: proofReference,
        },
      });
    } catch {
      await prisma.vault.update({
        where: { id: vaultId },
        data: {
          stellarStatus: StellarStatus.FAILED,
          stellarBalanceId: 'testnet-proof-unavailable',
        },
      });
    }
  }
}
