import { Asset, BASE_FEE, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { ActivityEventType, ActivityRail, ActivityStatus, ProofReceiptStatus, StellarStatus } from '@/lib/domain';
import { ConfigService } from '@/services/config-service';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { prisma } from '@/lib/prisma';
import { ActivityEventService } from '@/services/activity-event-service';
import { buildVaultAccessWhere, type VaultAccess } from '@/services/vault-access-service';

function buildLocalProofReference(vaultId: string) {
  return `betless-receipt-${vaultId.slice(0, 8)}-${Date.now().toString(36)}`;
}

function buildMemo(vaultId: string) {
  return `BTLS-${vaultId.slice(0, 20)}`;
}

function getExplorerUrl(transactionHash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${transactionHash}`;
}

type ProofAttempt = {
  status: typeof ProofReceiptStatus.LOCAL_RECEIPT | typeof ProofReceiptStatus.NETWORK_CONFIRMED;
  proofReference: string;
  transactionHash?: string | null;
  operationId?: string | null;
  ledger?: number | null;
  explorerUrl?: string | null;
  memo: string;
  message: string;
  rail: typeof ActivityRail.APP | typeof ActivityRail.STELLAR;
  activityType: typeof ActivityEventType.RECEIPT_SAVED | typeof ActivityEventType.STELLAR_PAYMENT_SUBMITTED;
  activityTitle: string;
};

export class StellarProofService {
  static validatePublicKey(walletAddress: string) {
    if (!isValidStellarPublicKey(walletAddress)) {
      throw new Error('Add a valid Stellar public address that starts with G.');
    }
  }

  private static async getFirstOperationId(server: Horizon.Server, transactionHash: string) {
    try {
      const operations = await server.operations().forTransaction(transactionHash).call();
      return operations.records?.[0]?.id ?? null;
    } catch {
      return null;
    }
  }

  private static async attemptNetworkProof(vault: { id: string; walletAddress: string }): Promise<ProofAttempt> {
    const sourceSecret = process.env.STELLAR_PROOF_SOURCE_SECRET;
    const memo = buildMemo(vault.id);

    if (!sourceSecret) {
      return {
        status: ProofReceiptStatus.LOCAL_RECEIPT,
        proofReference: buildLocalProofReference(vault.id),
        memo,
        rail: ActivityRail.APP,
        activityType: ActivityEventType.RECEIPT_SAVED,
        activityTitle: 'Receipt saved',
        message: 'Receipt saved. Stellar network confirmation can be added when network signing is enabled.',
      };
    }

    try {
      const sourceKeypair = Keypair.fromSecret(sourceSecret);
      const server = new Horizon.Server(ConfigService.getStellarHorizonUrl());

      await server.loadAccount(vault.walletAddress);
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
      const fee = await server.fetchBaseFee().catch(() => Number(BASE_FEE));

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: String(fee),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination: vault.walletAddress,
          asset: Asset.native(),
          amount: '0.0000001',
        }))
        .addMemo(Memo.text(memo))
        .setTimeout(60)
        .build();

      transaction.sign(sourceKeypair);
      const result = await server.submitTransaction(transaction) as {
        hash?: string;
        ledger?: number;
      };

      if (!result.hash) {
        throw new Error('Stellar did not return a transaction hash.');
      }

      const operationId = await this.getFirstOperationId(server, result.hash);

      return {
        status: ProofReceiptStatus.NETWORK_CONFIRMED,
        proofReference: result.hash,
        transactionHash: result.hash,
        operationId,
        ledger: result.ledger ?? null,
        explorerUrl: getExplorerUrl(result.hash),
        memo,
        rail: ActivityRail.STELLAR,
        activityType: ActivityEventType.STELLAR_PAYMENT_SUBMITTED,
        activityTitle: 'Stellar payment confirmed',
        message: 'Stellar payment confirmed and linked to this vault.',
      };
    } catch {
      return {
        status: ProofReceiptStatus.LOCAL_RECEIPT,
        proofReference: buildLocalProofReference(vault.id),
        memo,
        rail: ActivityRail.APP,
        activityType: ActivityEventType.RECEIPT_SAVED,
        activityTitle: 'Receipt saved',
        message: 'Receipt saved. Stellar network confirmation can be added when network submission is available.',
      };
    }
  }

  static async createOrUpdateCommitmentProof(vaultId: string, access: VaultAccess) {
    const vault = await prisma.vault.findFirst({
      where: buildVaultAccessWhere(vaultId, access),
      include: { appUser: true, receipts: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!vault) {
      throw new Error('Vault not found.');
    }

    this.validatePublicKey(vault.walletAddress);

    const existingReceipt = vault.receipts?.[0];
    if (existingReceipt && vault.stellarStatus === StellarStatus.CREATED) {
      return existingReceipt;
    }

    await prisma.vault.update({
      where: { id: vaultId },
      data: { stellarStatus: StellarStatus.PENDING },
    });

    const proof = await this.attemptNetworkProof({ id: vault.id, walletAddress: vault.walletAddress });

    return prisma.$transaction(async (tx: any) => {
      const receipt = await tx.proofReceipt.create({
        data: {
          appUserId: vault.appUserId,
          vaultId: vault.id,
          status: proof.status,
          network: 'Stellar Testnet',
          publicAddress: vault.walletAddress,
          proofReference: proof.proofReference,
          transactionHash: proof.transactionHash ?? null,
          operationId: proof.operationId ?? null,
          ledger: proof.ledger ?? null,
          memo: proof.memo,
          explorerUrl: proof.explorerUrl ?? null,
          message: proof.message,
        },
      });

      await ActivityEventService.create(tx, {
        appUserId: vault.appUserId,
        vaultId: vault.id,
        receiptId: receipt.id,
        type: proof.activityType,
        rail: proof.rail,
        status: ActivityStatus.COMPLETED,
        title: proof.activityTitle,
        description: proof.status === ProofReceiptStatus.NETWORK_CONFIRMED
          ? 'Payment operation recorded on Stellar Testnet.'
          : 'Vault receipt saved for this commitment.',
        walletAddress: vault.walletAddress,
        amount: proof.status === ProofReceiptStatus.NETWORK_CONFIRMED ? 0.0000001 : null,
        assetCode: proof.status === ProofReceiptStatus.NETWORK_CONFIRMED ? 'XLM' : null,
        transactionHash: proof.transactionHash ?? null,
        operationId: proof.operationId ?? null,
        ledger: proof.ledger ?? null,
        reference: proof.proofReference,
        explorerUrl: proof.explorerUrl ?? null,
        metadata: { memo: proof.memo, network: 'Stellar Testnet' },
      });

      await tx.vault.update({
        where: { id: vaultId },
        data: {
          stellarStatus: StellarStatus.CREATED,
          stellarBalanceId: proof.proofReference,
        },
      });

      return receipt;
    });
  }
}
