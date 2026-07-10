import { prisma } from '@/lib/prisma';
import type { ProofReceiptView } from '@/types/vault';

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

export class ReceiptService {
  static async listReceipts(clerkUserId: string) {
    const receipts = await prisma.proofReceipt.findMany({
      where: { appUser: { clerkUserId } },
      orderBy: { createdAt: 'desc' },
      include: { vault: true },
    });

    return receipts.map(toReceiptView);
  }

  static async getReceipt(id: string, clerkUserId: string) {
    const receipt = await prisma.proofReceipt.findFirst({
      where: { id, appUser: { clerkUserId } },
      include: { vault: true },
    });

    if (!receipt) {
      throw new Error('Receipt not found.');
    }

    return toReceiptView(receipt);
  }
}
