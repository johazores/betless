import { Asset, BASE_FEE, Horizon, Keypair, Memo, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { ProofReceiptStatus, StellarStatus } from '@/lib/domain';
import { ConfigService } from '@/services/config-service';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { prisma } from '@/lib/prisma';
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
};

export class StellarProofService {
  static validatePublicKey(walletAddress: string) {
    if (!isValidStellarPublicKey(walletAddress)) {
      throw new Error('Add a valid Stellar public address that starts with G.');
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
        message: 'Receipt saved. Network verification will be attached when a funded Stellar signer is connected.',
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
        successful?: boolean;
        _links?: { transaction?: { href?: string } };
      };

      if (!result.hash) {
        throw new Error('Stellar did not return a transaction hash.');
      }

      return {
        status: ProofReceiptStatus.NETWORK_CONFIRMED,
        proofReference: result.hash,
        transactionHash: result.hash,
        operationId: null,
        ledger: result.ledger ?? null,
        explorerUrl: getExplorerUrl(result.hash),
        memo,
        message: 'Network receipt created and linked to this vault.',
      };
    } catch {
      return {
        status: ProofReceiptStatus.LOCAL_RECEIPT,
        proofReference: buildLocalProofReference(vault.id),
        memo,
        message: 'Receipt saved. Network verification can be attached when Stellar submission is available.',
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
          network: 'Stellar',
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
