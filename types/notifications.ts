export type NotificationCategory =
  | 'ACCOUNT'
  | 'VAULT'
  | 'POINTS'
  | 'ON_CHAIN'
  | 'REWARDS'
  | 'SECURITY'
  | 'SYSTEM';

export type NotificationView = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
};

export type NotificationListView = {
  notifications: NotificationView[];
  unreadCount: number;
};

export type OnChainOverviewView = {
  enabled: boolean;
  networkLabel: string;
  status: 'healthy' | 'degraded' | 'offline' | 'disabled';
  statusMessage: string;
  lockedOnChain: number;
  pendingOperations: number;
  failedOperations: number;
  confirmedLocks: number;
  recentOperations: OnChainActivityItem[];
};

export type OnChainActivityItem = {
  id: string;
  kind: string;
  state: string;
  vaultId: string;
  amount: number;
  txHash: string | null;
  explorerUrl: string | null;
  createdAt: string;
  vaultLabel: string;
};
