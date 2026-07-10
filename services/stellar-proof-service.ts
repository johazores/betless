import { Asset, BASE_FEE, Horizon, Keypair, Memo, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { ActivityEventType, ActivityRail, ActivityStatus, ProofReceiptStatus, StellarStatus } from '@/lib/domain';
import { ConfigService } from '@/services/config-service';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { prisma } from '@/lib/prisma';
import { ActivityEventService } from '@/services/activity-event-service';
import { StellarService, StellarServiceError } from '@/services/stellar-service';
import { buildVaultAccessWhere, type VaultAccess } from '@/services/vault-access-service';
import {
  buildStellarAccountExplorerUrl,
  buildStellarOperationExplorerUrl,
  buildStellarTransactionExplorerUrl,
} from '@/lib/stellar-explorer';

const PROOF_PAYMENT_AMOUNT = '0.0000001';

function buildLocalProofReference(vaultId: string) {
  return `betless-receipt-${vaultId.slice(0, 8)}-${Date.now().toString(36)}`;
}

function buildMemo(vaultId: string) {
  return `BTLS-${vaultId.slice(0, 20)}`;
}

type ProofSuccess = {
  status: typeof ProofReceiptStatus.LOCAL_RECEIPT | typeof ProofReceiptStatus.NETWORK_CONFIRMED;
  proofReference: string;
  sourceAccount?: string | null;
  destinationAccount: string;
  transactionHash?: string | null;
  operationId?: string | null;
  ledger?: number | null;
  explorerUrl: string;
  accountExplorerUrl: string;
  memo: string;
  message: string;
  rail: typeof ActivityRail.APP | typeof ActivityRail.STELLAR;
  activityType: typeof ActivityEventType.RECEIPT_SAVED | typeof ActivityEventType.STELLAR_PAYMENT_SUBMITTED;
  activityTitle: string;
};

type ProofOutcome =
  | { ok: true; proof: ProofSuccess }
  | { ok: false; message: string; resultCodes?: unknown };

export class StellarProofService {
  static validatePublicKey(walletAddress: string) {
    if (!isValidStellarPublicKey(walletAddress)) {
      throw new Error('Add a valid Stellar public address that starts with G.');
    }
  }

  private static buildAccountOnlyProof(vault: { id: string; walletAddress: string }, message: string): ProofSuccess {
    const network = ConfigService.getStellarNetwork();
    const memo = buildMemo(vault.id);
    const accountExplorerUrl = buildStellarAccountExplorerUrl(vault.walletAddress, network);

    return {
      status: ProofReceiptStatus.LOCAL_RECEIPT,
      proofReference: buildLocalProofReference(vault.id),
      destinationAccount: vault.walletAddress,
      explorerUrl: accountExplorerUrl,
      accountExplorerUrl,
      memo,
      rail: ActivityRail.APP,
      activityType: ActivityEventType.RECEIPT_SAVED,
      activityTitle: 'Receipt saved',
      message,
    };
  }

  private static async attemptNetworkProof(vault: { id: string; walletAddress: string }): Promise<ProofOutcome> {
    const sourceSecret = process.env.STELLAR_PROOF_SOURCE_SECRET;
    const network = ConfigService.getStellarNetwork();
    const memo = buildMemo(vault.id);

    // No configured signer: we cannot submit a network transaction. Emit an
    // explicit, honest wallet-only receipt (the address is real and verifiable
    // on the Explorer) rather than pretending a network confirmation failed.
    if (!sourceSecret) {
      return {
        ok: true,
        proof: this.buildAccountOnlyProof(
          vault,
          'Receipt saved. This wallet is verifiable on Stellar Explorer. A network transaction is not configured on this deployment.',
        ),
      };
    }

    try {
      const sourceKeypair = Keypair.fromSecret(sourceSecret);

      // The payment needs a destination that exists on-ledger. On testnet this
      // funds the wallet via Friendbot if it has not been activated yet.
      await StellarService.ensureAccountFunded(vault.walletAddress);

      const source = await StellarService.getAccount(sourceKeypair.publicKey());
      if (!source) {
        return {
          ok: false,
          message: 'The configured Stellar signer account is not funded on this network.',
        };
      }

      const server = new Horizon.Server(ConfigService.getStellarHorizonUrl());
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
      const fee = await server.fetchBaseFee().catch(() => Number(BASE_FEE));

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: String(fee),
        networkPassphrase: ConfigService.getStellarNetworkPassphrase(),
      })
        .addOperation(Operation.payment({
          destination: vault.walletAddress,
          asset: Asset.native(),
          amount: PROOF_PAYMENT_AMOUNT,
        }))
        .addMemo(Memo.text(memo))
        .setTimeout(60)
        .build();

      transaction.sign(sourceKeypair);

      const result = await StellarService.submitAndConfirm(transaction);
      const operationId = await StellarService.getFirstOperationId(result.hash);
      const transactionExplorerUrl = buildStellarTransactionExplorerUrl(result.hash, network);
      const accountExplorerUrl = buildStellarAccountExplorerUrl(vault.walletAddress, network);

      return {
        ok: true,
        proof: {
          status: ProofReceiptStatus.NETWORK_CONFIRMED,
          proofReference: result.hash,
          sourceAccount: sourceKeypair.publicKey(),
          destinationAccount: vault.walletAddress,
          transactionHash: result.hash,
          operationId,
          ledger: result.ledger,
          explorerUrl: transactionExplorerUrl,
          accountExplorerUrl,
          memo,
          rail: ActivityRail.STELLAR,
          activityType: ActivityEventType.STELLAR_PAYMENT_SUBMITTED,
          activityTitle: 'Stellar transaction confirmed',
          message: 'Stellar transaction confirmed. You can verify it on Stellar Explorer.',
        },
      };
    } catch (error) {
      const resultCodes = error instanceof StellarServiceError ? error.resultCodes : undefined;
      const message = error instanceof Error ? error.message : 'The Stellar transaction could not be completed.';
      return { ok: false, message, resultCodes };
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
      data: { stellarStatus: StellarStatus.PENDING, stellarError: null },
    });

    const outcome = await this.attemptNetworkProof({ id: vault.id, walletAddress: vault.walletAddress });
    const networkLabel = ConfigService.getStellarNetworkLabel();

    if (!outcome.ok) {
      // Persist the failure (committed) and only then surface the error so the
      // FAILED state and activity event survive; the UI can retry.
      await prisma.$transaction(async (tx: any) => {
        await ActivityEventService.create(tx, {
          appUserId: vault.appUserId,
          vaultId: vault.id,
          type: ActivityEventType.STELLAR_PAYMENT_SUBMITTED,
          rail: ActivityRail.STELLAR,
          status: ActivityStatus.FAILED,
          title: 'Stellar transaction failed',
          description: outcome.message,
          walletAddress: vault.walletAddress,
          destinationAccount: vault.walletAddress,
          network: networkLabel,
          accountExplorerUrl: buildStellarAccountExplorerUrl(vault.walletAddress, ConfigService.getStellarNetwork()),
          metadata: outcome.resultCodes ? { resultCodes: outcome.resultCodes } : undefined,
        });

        await tx.vault.update({
          where: { id: vaultId },
          data: { stellarStatus: StellarStatus.FAILED, stellarError: outcome.message },
        });
      });

      throw new Error(outcome.message);
    }

    const proof = outcome.proof;
    const operationExplorerUrl = proof.operationId
      ? buildStellarOperationExplorerUrl(proof.operationId, ConfigService.getStellarNetwork())
      : null;

    return prisma.$transaction(async (tx: any) => {
      const receipt = await tx.proofReceipt.create({
        data: {
          appUserId: vault.appUserId,
          vaultId: vault.id,
          status: proof.status,
          network: networkLabel,
          publicAddress: vault.walletAddress,
          sourceAccount: proof.sourceAccount ?? null,
          destinationAccount: proof.destinationAccount,
          proofReference: proof.proofReference,
          transactionHash: proof.transactionHash ?? null,
          operationId: proof.operationId ?? null,
          ledger: proof.ledger ?? null,
          memo: proof.memo,
          explorerUrl: proof.explorerUrl,
          accountExplorerUrl: proof.accountExplorerUrl,
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
          ? `Payment operation recorded on ${networkLabel}.`
          : 'Vault receipt saved. Wallet verification is available on Stellar Explorer.',
        walletAddress: vault.walletAddress,
        sourceAccount: proof.sourceAccount ?? null,
        destinationAccount: proof.destinationAccount,
        network: networkLabel,
        amount: proof.status === ProofReceiptStatus.NETWORK_CONFIRMED ? Number(PROOF_PAYMENT_AMOUNT) : null,
        assetCode: proof.status === ProofReceiptStatus.NETWORK_CONFIRMED ? 'XLM' : null,
        transactionHash: proof.transactionHash ?? null,
        operationId: proof.operationId ?? null,
        ledger: proof.ledger ?? null,
        reference: proof.proofReference,
        explorerUrl: proof.explorerUrl,
        accountExplorerUrl: proof.accountExplorerUrl,
        metadata: { memo: proof.memo, network: networkLabel, operationExplorerUrl },
      });

      await tx.vault.update({
        where: { id: vaultId },
        data: {
          stellarStatus: StellarStatus.CREATED,
          stellarProofReference: proof.proofReference,
          stellarError: null,
        },
      });

      return receipt;
    });
  }
}
