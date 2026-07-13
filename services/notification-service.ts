import { prisma } from '@/lib/prisma';
import { formatPeso } from '@/lib/money';
import type { NotificationCategory, NotificationListView, NotificationView } from '@/types/notifications';

type CreateInput = {
  appUserId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
};

function toView(row: {
  id: string;
  category: string;
  title: string;
  body: string;
  readAt: Date | null;
  actionUrl: string | null;
  createdAt: Date;
}): NotificationView {
  return {
    id: row.id,
    category: row.category as NotificationCategory,
    title: row.title,
    body: row.body,
    readAt: row.readAt?.toISOString() ?? null,
    actionUrl: row.actionUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export class NotificationService {
  static async create(input: CreateInput) {
    return prisma.notification.create({
      data: {
        appUserId: input.appUserId,
        category: input.category,
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  /** Fire-and-forget wrapper — never blocks product flows. */
  static notify(input: CreateInput) {
    void this.create(input).catch(() => {});
  }

  static async listForUser(appUserId: string, options?: { category?: NotificationCategory; limit?: number }) {
    const limit = options?.limit ?? 50;
    const where: { appUserId: string; category?: NotificationCategory } = { appUserId };
    if (options?.category) where.category = options.category;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({ where: { appUserId, readAt: null } }),
    ]);

    return {
      notifications: notifications.map(toView),
      unreadCount,
    } satisfies NotificationListView;
  }

  static async unreadCount(appUserId: string) {
    return prisma.notification.count({ where: { appUserId, readAt: null } });
  }

  static async markRead(appUserId: string, notificationId: string, read: boolean) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, appUserId },
      data: { readAt: read ? new Date() : null },
    });
    if (result.count === 0) throw new Error('Notification not found.');
  }

  static async markAllRead(appUserId: string) {
    await prisma.notification.updateMany({
      where: { appUserId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  // --- Event helpers ---

  static notifyWelcome(appUserId: string, displayName: string | null) {
    this.notify({
      appUserId,
      category: 'ACCOUNT',
      title: 'Welcome to Betless',
      body: `Your account is ready${displayName ? `, ${displayName.split(' ')[0]}` : ''}. Open your first vault to start earning points.`,
      actionUrl: '/create-vault',
    });
  }

  static notifyVaultCreated(appUserId: string, vaultId: string, amount: number, lockMonths: number) {
    this.notify({
      appUserId,
      category: 'VAULT',
      title: 'Vault created',
      body: `${formatPeso(amount)} locked for ${lockMonths} months. Your deposit is being secured on the Stellar network.`,
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, amount, lockMonths },
    });
  }

  static notifyVaultFunded(appUserId: string, vaultId: string, amount: number) {
    this.notify({
      appUserId,
      category: 'VAULT',
      title: 'Deposit confirmed',
      body: `${formatPeso(amount)} is now locked in your vault and earning toward monthly rewards.`,
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, amount },
    });
  }

  static notifyPointsEarned(appUserId: string, points: number, description: string, vaultId?: string) {
    this.notify({
      appUserId,
      category: 'POINTS',
      title: 'Points earned',
      body: `+${points.toLocaleString('en-PH')} points — ${description}`,
      actionUrl: vaultId ? `/vaults/${vaultId}` : '/rewards',
      metadata: { points, vaultId },
    });
  }

  static notifyPointsRedeemed(appUserId: string, rewardName: string, points: number) {
    this.notify({
      appUserId,
      category: 'REWARDS',
      title: 'Reward redeemed',
      body: `${rewardName} for ${points.toLocaleString('en-PH')} points is ready. Check your voucher in Rewards.`,
      actionUrl: '/rewards',
      metadata: { rewardName, points },
    });
  }

  static notifyVaultMatured(appUserId: string, vaultId: string, amount: number) {
    this.notify({
      appUserId,
      category: 'VAULT',
      title: 'Vault matured',
      body: `Your ${formatPeso(amount)} deposit has matured and is being returned to you.`,
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, amount },
    });
  }

  static async notifyVaultMaturitySoon(appUserId: string, vaultId: string, amount: number, daysLeft: number) {
    const existing = await prisma.notification.findFirst({
      where: {
        appUserId,
        category: 'VAULT',
        title: 'Vault maturing soon',
        actionUrl: `/vaults/${vaultId}`,
      },
    });
    if (existing) return;

    this.notify({
      appUserId,
      category: 'VAULT',
      title: 'Vault maturing soon',
      body:
        daysLeft <= 1
          ? `Your ${formatPeso(amount)} vault matures tomorrow. Your full deposit will be returned automatically.`
          : `Your ${formatPeso(amount)} vault matures in ${daysLeft} days. Your full deposit will be returned automatically.`,
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, amount, daysLeft },
    });
  }

  static notifyOnChainConfirmed(appUserId: string, vaultId: string, kind: string, txHash: string | null) {
    const labels: Record<string, string> = {
      LOCK: 'Deposit locked on Stellar',
      CLAIM_MATURITY: 'Maturity claim confirmed',
      CLAIM_EARLY: 'Early withdrawal settled on-chain',
    };
    this.notify({
      appUserId,
      category: 'ON_CHAIN',
      title: labels[kind] ?? 'On-chain transaction confirmed',
      body: 'Your transaction was confirmed on the Stellar network. You can verify it independently from your vault.',
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, kind, txHash },
    });
  }

  static notifyOnChainPending(appUserId: string, vaultId: string, kind: string) {
    this.notify({
      appUserId,
      category: 'ON_CHAIN',
      title: 'On-chain transaction pending',
      body: 'Your transaction is being processed on the Stellar network. This usually completes within a few seconds.',
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, kind },
    });
  }

  static notifyOnChainFailed(appUserId: string, vaultId: string, kind: string) {
    this.notify({
      appUserId,
      category: 'ON_CHAIN',
      title: 'On-chain transaction needs attention',
      body: 'A network transaction could not be completed. Your vault and points are unaffected — our team will retry automatically.',
      actionUrl: `/vaults/${vaultId}`,
      metadata: { vaultId, kind },
    });
  }

  static notifyReferralFriendJoined(
    referrerId: string,
    friendDisplayName: string | null,
    points: number,
  ) {
    const friend = friendDisplayName?.split(' ')[0] ?? 'A friend';
    this.notify({
      appUserId: referrerId,
      category: 'ACCOUNT',
      title: 'Someone joined with your invite',
      body: `${friend} signed up using your referral link. You both earned ${points.toLocaleString('en-PH')} points.`,
      actionUrl: '/rewards',
      metadata: { points, friendDisplayName },
    });
  }

  static notifyReferralWelcomeBonus(
    joinerId: string,
    referrerName: string | null,
    points: number,
  ) {
    const referrer = referrerName?.split(' ')[0] ?? 'your friend';
    this.notify({
      appUserId: joinerId,
      category: 'POINTS',
      title: 'Welcome bonus applied',
      body: `You joined with ${referrer}'s invite and earned ${points.toLocaleString('en-PH')} points.`,
      actionUrl: '/rewards',
      metadata: { points, referrerName },
    });
  }
}
