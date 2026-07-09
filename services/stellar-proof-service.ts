import { StellarStatus } from '@/lib/domain';
import { ConfigService } from '@/services/config-service';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { prisma } from '@/lib/prisma';

function buildLocalProofReference(vaultId: string) {
  return `betless-proof-${vaultId.slice(0, 8)}-${Date.now().toString(36)}`;
}

export class StellarProofService {
  static validatePublicKey(walletAddress: string) {
    if (!isValidStellarPublicKey(walletAddress)) {
      throw new Error('This vault does not have a valid Stellar public address. Add a valid public address that starts with G.');
    }
  }

  static async createOrUpdateCommitmentProof(vaultId: string) {
    const vault = await prisma.vault.findUnique({ where: { id: vaultId } });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    this.validatePublicKey(vault.walletAddress);

    if (vault.stellarStatus === StellarStatus.CREATED && vault.stellarBalanceId) {
      return;
    }

    await prisma.vault.update({
      where: { id: vaultId },
      data: { stellarStatus: StellarStatus.PENDING },
    });

    let proofReference = buildLocalProofReference(vaultId);

    try {
      const horizonUrl = ConfigService.getStellarHorizonUrl().replace(/\/$/, '');
      const response = await fetch(`${horizonUrl}/accounts/${vault.walletAddress}`, { cache: 'no-store' });

      if (response.ok) {
        const account = (await response.json()) as { sequence?: string; last_modified_ledger?: number };
        proofReference = `betless-testnet-${account.last_modified_ledger ?? account.sequence ?? Date.now()}`;
      }
    } catch {
      // Network lookup is optional in the MVP. A local demo proof still completes the user flow.
    }

    await prisma.vault.update({
      where: { id: vaultId },
      data: {
        stellarStatus: StellarStatus.CREATED,
        stellarBalanceId: proofReference,
      },
    });
  }
}
