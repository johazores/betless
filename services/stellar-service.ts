import {
  BASE_FEE,
  Claimant,
  Memo,
  Operation,
  TransactionBuilder,
  type Transaction,
} from '@stellar/stellar-sdk';
import { decimalToNumber } from '@/lib/domain';
import { prisma } from '@/lib/prisma';
import {
  buildTransactionExplorerUrl,
  getHorizonServer,
  getNetworkPassphrase,
  getOpsKeypair,
  getTreasuryKeypair,
  getVaultAsset,
  isStellarEnabled,
} from '@/lib/stellar-config';
import type { VaultStellarView } from '@/types/vault';
import { NotificationService } from '@/services/notification-service';

const StellarOperationKind = {
  LOCK: 'LOCK',
  CLAIM_MATURITY: 'CLAIM_MATURITY',
  CLAIM_EARLY: 'CLAIM_EARLY',
} as const;

const StellarOperationState = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
} as const;

type OperationKind = (typeof StellarOperationKind)[keyof typeof StellarOperationKind];

type LockableVault = {
  id: string;
  principal: unknown;
  maturesAt: Date;
};

type ReleasableVault = {
  id: string;
  principal: unknown;
  claimableBalanceId: string | null;
};

type OperationRow = {
  id: string;
  vaultId: string;
  kind: OperationKind;
  state: string;
  txHash: string | null;
  claimableBalanceId: string | null;
  createdAt: Date;
};

/** How long after submission a missing transaction is considered expired. */
const SUBMISSION_EXPIRY_MS = 2 * 60 * 1000;
const TX_TIMEOUT_SECONDS = 60;
const FEE = String(Number(BASE_FEE) * 10);

function toAmountString(principal: unknown) {
  return decimalToNumber(principal).toFixed(2);
}

function extractErrorMessage(error: unknown) {
  const resultCodes = (error as { response?: { data?: { extras?: { result_codes?: unknown } } } })
    ?.response?.data?.extras?.result_codes;
  if (resultCodes) return JSON.stringify(resultCodes);
  return error instanceof Error ? error.message : 'Unknown Stellar error.';
}

function isTimeoutError(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 504;
}

/**
 * On-chain settlement for vault principal, per docs/stellar-architecture.md.
 *
 * Every write goes through the StellarOperation outbox: intent is recorded in
 * Postgres before submission, the signed XDR and expected hash are persisted
 * before the network call, and unresolved rows are re-driven by
 * `processPendingForVault`. All entry points are best-effort no-ops when the
 * Stellar environment is not configured, so the product works fully off-chain.
 */
export class StellarService {
  static isEnabled() {
    return isStellarEnabled();
  }

  /**
   * Locks a vault's principal in a claimable balance:
   * - treasury may claim only after `maturesAt` (the enforced lock);
   * - ops account may claim unconditionally (early-withdrawal escape hatch).
   */
  static async lockVaultPrincipal(vault: LockableVault) {
    if (!this.isEnabled()) return;

    const existing = await prisma.stellarOperation.findFirst({
      where: {
        vaultId: vault.id,
        kind: StellarOperationKind.LOCK,
        state: { in: [StellarOperationState.SUBMITTED, StellarOperationState.CONFIRMED] },
      },
    });
    if (existing) return;

    const operation = await prisma.stellarOperation.create({
      data: {
        vaultId: vault.id,
        kind: StellarOperationKind.LOCK,
        amount: decimalToNumber(vault.principal),
      },
    });

    await this.attemptLock(operation.id, vault);
  }

  /** Claims the vault's balance back to the platform when the vault closes. */
  static async releaseVaultPrincipal(vault: ReleasableVault, kind: 'CLAIM_MATURITY' | 'CLAIM_EARLY') {
    if (!this.isEnabled() || !vault.claimableBalanceId) return;

    const existing = await prisma.stellarOperation.findFirst({
      where: {
        vaultId: vault.id,
        kind: { in: [StellarOperationKind.CLAIM_MATURITY, StellarOperationKind.CLAIM_EARLY] },
        state: { in: [StellarOperationState.SUBMITTED, StellarOperationState.CONFIRMED] },
      },
    });
    if (existing) return;

    const operation = await prisma.stellarOperation.create({
      data: {
        vaultId: vault.id,
        kind,
        amount: decimalToNumber(vault.principal),
        claimableBalanceId: vault.claimableBalanceId,
      },
    });

    await this.attemptRelease(operation.id, vault, kind);
  }

  /**
   * Re-drives unresolved outbox rows for one vault: confirms SUBMITTED rows by
   * hash (or expires them) and retries PENDING rows. Called lazily from the
   * vault detail read, consistent with the app's no-cron design.
   */
  static async processPendingForVault(vaultId: string) {
    if (!this.isEnabled()) return;

    const rows: OperationRow[] = await prisma.stellarOperation.findMany({
      where: {
        vaultId,
        state: { in: [StellarOperationState.PENDING, StellarOperationState.SUBMITTED] },
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const row of rows) {
      try {
        if (row.state === StellarOperationState.SUBMITTED) {
          await this.confirmSubmitted(row);
        } else {
          await this.retryPending(row);
        }
      } catch {
        // Best-effort: leave the row for the next read.
      }
    }
  }

  static toStellarView(vault: {
    claimableBalanceId: string | null;
    stellarOperations: Array<{ kind: string; state: string; txHash: string | null }>;
  }): VaultStellarView | null {
    const rows = vault.stellarOperations;
    if (rows.length === 0 && !vault.claimableBalanceId) return null;

    const lock = rows.find((row) => row.kind === StellarOperationKind.LOCK && row.state === StellarOperationState.CONFIRMED);
    const release = rows.find(
      (row) => row.kind !== StellarOperationKind.LOCK && row.state === StellarOperationState.CONFIRMED,
    );
    const hasUnresolved = rows.some(
      (row) => row.state === StellarOperationState.PENDING || row.state === StellarOperationState.SUBMITTED,
    );
    const hasFailure = rows.some((row) => row.state === StellarOperationState.FAILED);

    const status = release ? 'RELEASED' : lock ? 'LOCKED' : hasUnresolved ? 'PENDING' : hasFailure ? 'FAILED' : 'PENDING';

    return {
      status,
      claimableBalanceId: vault.claimableBalanceId,
      lockTxHash: lock?.txHash ?? null,
      releaseTxHash: release?.txHash ?? null,
      lockExplorerUrl: lock?.txHash ? buildTransactionExplorerUrl(lock.txHash) : null,
      releaseExplorerUrl: release?.txHash ? buildTransactionExplorerUrl(release.txHash) : null,
    };
  }

  static async retryOperation(operationId: string) {
    if (!this.isEnabled()) {
      throw new Error('Stellar is not configured.');
    }

    const row: OperationRow | null = await prisma.stellarOperation.findUnique({
      where: { id: operationId },
      select: {
        id: true,
        vaultId: true,
        kind: true,
        state: true,
        txHash: true,
        claimableBalanceId: true,
        createdAt: true,
      },
    });

    if (!row) throw new Error('Stellar operation not found.');
    if (row.state === StellarOperationState.CONFIRMED) {
      throw new Error('Confirmed operations do not need a retry.');
    }

    if (row.state === StellarOperationState.SUBMITTED) {
      await this.confirmSubmitted(row);
    } else {
      await this.retryPending(row);
    }

    return prisma.stellarOperation.findUniqueOrThrow({ where: { id: operationId } });
  }

  // ---------------------------------------------------------------------------

  private static async attemptLock(operationId: string, vault: LockableVault) {
    try {
      const server = getHorizonServer();
      const treasury = getTreasuryKeypair();
      const ops = getOpsKeypair();
      const asset = getVaultAsset();
      const amount = toAmountString(vault.principal);
      const maturityUnixSeconds = String(Math.floor(vault.maturesAt.getTime() / 1000));

      const source = await server.loadAccount(treasury.publicKey());
      const transaction = new TransactionBuilder(source, {
        fee: FEE,
        networkPassphrase: getNetworkPassphrase(),
      })
        .addOperation(
          Operation.createClaimableBalance({
            asset,
            amount,
            claimants: [
              // The lock: the treasury cannot reclaim the principal before maturity.
              new Claimant(
                treasury.publicKey(),
                Claimant.predicateNot(Claimant.predicateBeforeAbsoluteTime(maturityUnixSeconds)),
              ),
              // The escape hatch for early withdrawals, held by a separate signer.
              new Claimant(ops.publicKey(), Claimant.predicateUnconditional()),
            ],
          }),
        )
        .addMemo(Memo.text(vault.id.slice(0, 28)))
        .setTimeout(TX_TIMEOUT_SECONDS)
        .build();

      const claimableBalanceId = transaction.getClaimableBalanceId(0);
      transaction.sign(treasury);

      await this.submitWithOutbox(operationId, transaction, claimableBalanceId, async () => {
        await prisma.vault.update({
          where: { id: vault.id },
          data: { claimableBalanceId },
        });
      });
    } catch (error) {
      await this.markFailed(operationId, error);
    }
  }

  private static async attemptRelease(
    operationId: string,
    vault: ReleasableVault,
    kind: 'CLAIM_MATURITY' | 'CLAIM_EARLY',
  ) {
    try {
      const server = getHorizonServer();
      const treasury = getTreasuryKeypair();
      const ops = getOpsKeypair();
      const asset = getVaultAsset();
      const amount = toAmountString(vault.principal);
      const balanceId = vault.claimableBalanceId!;

      // At maturity the treasury's own time predicate is satisfied. Before
      // maturity only the ops claimant can claim; it forwards the full amount
      // back to the treasury in the same atomic transaction.
      const signer = kind === 'CLAIM_MATURITY' ? treasury : ops;
      const source = await server.loadAccount(signer.publicKey());

      const builder = new TransactionBuilder(source, {
        fee: FEE,
        networkPassphrase: getNetworkPassphrase(),
      }).addOperation(Operation.claimClaimableBalance({ balanceId }));

      if (kind === 'CLAIM_EARLY') {
        builder.addOperation(
          Operation.payment({
            destination: treasury.publicKey(),
            asset,
            amount,
          }),
        );
      }

      const transaction = builder
        .addMemo(Memo.text(vault.id.slice(0, 28)))
        .setTimeout(TX_TIMEOUT_SECONDS)
        .build();

      transaction.sign(signer);
      await this.submitWithOutbox(operationId, transaction, balanceId);
    } catch (error) {
      await this.markFailed(operationId, error);
    }
  }

  /**
   * Persists the signed envelope and expected hash, then submits. On timeout
   * the row stays SUBMITTED and is later resolved by hash; on a definitive
   * Horizon rejection it is marked FAILED (safe to rebuild — the envelope's
   * timebounds have a 60s ceiling, so it cannot land later).
   */
  private static async submitWithOutbox(
    operationId: string,
    transaction: Transaction,
    claimableBalanceId: string | null,
    onConfirmed?: () => Promise<void>,
  ) {
    const txHash = transaction.hash().toString('hex');

    await prisma.stellarOperation.update({
      where: { id: operationId },
      data: {
        xdr: transaction.toXDR(),
        txHash,
        claimableBalanceId,
        state: StellarOperationState.SUBMITTED,
      },
    });

    try {
      await getHorizonServer().submitTransaction(transaction);
    } catch (error) {
      if (isTimeoutError(error)) {
        return; // Stays SUBMITTED; confirmSubmitted resolves it by hash later.
      }
      await this.markFailed(operationId, error);
      return;
    }

    await prisma.stellarOperation.update({
      where: { id: operationId },
      data: { state: StellarOperationState.CONFIRMED, errorMessage: null },
    });

    if (onConfirmed) await onConfirmed();
    await this.notifyOperationEvent(operationId, 'confirmed');
  }

  private static async confirmSubmitted(row: OperationRow) {
    if (!row.txHash) {
      await prisma.stellarOperation.update({
        where: { id: row.id },
        data: { state: StellarOperationState.FAILED, errorMessage: 'Submitted without a hash.' },
      });
      return;
    }

    try {
      const record = await getHorizonServer().transactions().transaction(row.txHash).call();
      const successful = (record as { successful?: boolean }).successful !== false;

      await prisma.stellarOperation.update({
        where: { id: row.id },
        data: {
          state: successful ? StellarOperationState.CONFIRMED : StellarOperationState.FAILED,
          errorMessage: successful ? null : 'Transaction included but failed.',
        },
      });

      if (successful && row.kind === StellarOperationKind.LOCK && row.claimableBalanceId) {
        await prisma.vault.update({
          where: { id: row.vaultId },
          data: { claimableBalanceId: row.claimableBalanceId },
        });
      }

      if (successful) {
        await this.notifyOperationEvent(row.id, 'confirmed');
      } else {
        await this.notifyOperationEvent(row.id, 'failed');
      }
    } catch (error) {
      const notFound = (error as { response?: { status?: number } })?.response?.status === 404;
      const expired = Date.now() - row.createdAt.getTime() > SUBMISSION_EXPIRY_MS;

      if (notFound && expired) {
        // Timebounds have passed: the envelope can never land. Reset to PENDING
        // so the next sweep rebuilds a fresh transaction.
        await prisma.stellarOperation.update({
          where: { id: row.id },
          data: {
            state: StellarOperationState.PENDING,
            txHash: null,
            xdr: null,
            errorMessage: 'Submission expired; will rebuild.',
          },
        });
      }
      // Otherwise leave SUBMITTED and check again on the next read.
    }
  }

  private static async retryPending(row: OperationRow) {
    const vault = await prisma.vault.findUnique({ where: { id: row.vaultId } });
    if (!vault) return;

    if (row.kind === StellarOperationKind.LOCK) {
      await this.attemptLock(row.id, vault);
    } else {
      await this.attemptRelease(row.id, vault, row.kind as 'CLAIM_MATURITY' | 'CLAIM_EARLY');
    }
  }

  private static async markFailed(operationId: string, error: unknown) {
    await prisma.stellarOperation.update({
      where: { id: operationId },
      data: {
        state: StellarOperationState.FAILED,
        errorMessage: extractErrorMessage(error).slice(0, 500),
      },
    });
    await this.notifyOperationEvent(operationId, 'failed');
  }

  private static async notifyOperationEvent(operationId: string, event: 'confirmed' | 'failed') {
    const row = await prisma.stellarOperation.findUnique({
      where: { id: operationId },
      include: { vault: { select: { id: true, appUserId: true } } },
    });
    if (!row?.vault) return;

    if (event === 'confirmed') {
      NotificationService.notifyOnChainConfirmed(row.vault.appUserId, row.vault.id, row.kind, row.txHash);
    } else {
      NotificationService.notifyOnChainFailed(row.vault.appUserId, row.vault.id, row.kind);
    }
  }
}
