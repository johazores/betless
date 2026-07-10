import { ActivityEventType, ActivityRail, ActivityStatus, decimalToNumber } from '@/lib/domain';
import { formatPeso } from '@/lib/money';
import type { ActivityItemView } from '@/types/vault';

type DbClient = any;

type ActivityEventInput = {
  appUserId?: string | null;
  vaultId?: string | null;
  receiptId?: string | null;
  type: keyof typeof ActivityEventType | string;
  rail?: keyof typeof ActivityRail | string;
  status?: keyof typeof ActivityStatus | string;
  title: string;
  description: string;
  walletAddress?: string | null;
  amount?: number | null;
  assetCode?: string | null;
  transactionHash?: string | null;
  operationId?: string | null;
  ledger?: number | null;
  reference?: string | null;
  explorerUrl?: string | null;
  metadata?: Record<string, unknown> | null;
};

export class ActivityEventService {
  static async create(client: DbClient, input: ActivityEventInput) {
    return client.activityEvent.create({
      data: {
        appUserId: input.appUserId ?? null,
        vaultId: input.vaultId ?? null,
        receiptId: input.receiptId ?? null,
        type: input.type,
        rail: input.rail ?? ActivityRail.APP,
        status: input.status ?? ActivityStatus.COMPLETED,
        title: input.title,
        description: input.description,
        walletAddress: input.walletAddress ?? null,
        amount: input.amount ?? null,
        assetCode: input.assetCode ?? null,
        transactionHash: input.transactionHash ?? null,
        operationId: input.operationId ?? null,
        ledger: input.ledger ?? null,
        reference: input.reference ?? null,
        explorerUrl: input.explorerUrl ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  static toView(event: any): ActivityItemView {
    const vaultId = event.vaultId ?? null;
    const receiptId = event.receiptId ?? null;
    const href = receiptId ? `/receipts/${receiptId}` : vaultId ? `/vaults/${vaultId}` : '/dashboard';

    return {
      id: event.id,
      type: event.type,
      rail: event.rail,
      status: event.status,
      title: event.title,
      description: event.description,
      walletAddress: event.walletAddress ?? null,
      amount: event.amount == null ? null : decimalToNumber(event.amount),
      assetCode: event.assetCode ?? null,
      transactionHash: event.transactionHash ?? null,
      operationId: event.operationId ?? null,
      ledger: event.ledger ?? null,
      reference: event.reference ?? null,
      explorerUrl: event.explorerUrl ?? null,
      vaultId,
      receiptId,
      href,
      createdAt: event.createdAt.toISOString(),
    };
  }

  static buildVaultCreatedDescription(currentAmount: number, targetAmount: number) {
    return `${formatPeso(currentAmount)} committed toward ${formatPeso(targetAmount)}`;
  }
}
