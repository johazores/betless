import { prisma } from '@/lib/prisma';
import type { ProofReceiptView } from '@/types/vault';
import type { VaultAccess } from '@/services/vault-access-service';
import { requireVaultAccess } from '@/services/vault-access-service';

function toReceiptView(receipt: any): ProofReceiptView {
  return {
    id: receipt.id,
    vaultId: receipt.vaultId,
    status: receipt.status,
    network: receipt.network,
    publicAddress: receipt.publicAddress,
    proofReference: receipt.proofReference,
    transactionHash: receipt.transactionHash,
    operationId: receipt.operationId,
    ledger: receipt.ledger,
    memo: receipt.memo,
    explorerUrl: receipt.explorerUrl,
    message: receipt.message,
    createdAt: receipt.createdAt.toISOString(),
  };
}

function buildReceiptAccessWhere(access: VaultAccess) {
  requireVaultAccess(access);

  const conditions: Array<Record<string, unknown>> = [];

  if (access.clerkUserId) {
    conditions.push({ appUser: { clerkUserId: access.clerkUserId } });
    conditions.push({ vault: { appUser: { clerkUserId: access.clerkUserId } } });
  }

  if (access.vaultAccessTokenHash) {
    conditions.push({ vault: { guestAccessTokenHash: access.vaultAccessTokenHash } });
  }

  return conditions;
}

export class ReceiptService {
  static async listReceipts(clerkUserId: string) {
    const receipts = await prisma.proofReceipt.findMany({
      where: {
        OR: [
          { appUser: { clerkUserId } },
          { vault: { appUser: { clerkUserId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { vault: true },
    });

    return receipts.map(toReceiptView);
  }

  static async getReceipt(id: string, access: VaultAccess) {
    const receipt = await prisma.proofReceipt.findFirst({
      where: { id, OR: buildReceiptAccessWhere(access) },
      include: { vault: true },
    });

    if (!receipt) {
      throw new Error('Receipt not found.');
    }

    return toReceiptView(receipt);
  }
}
