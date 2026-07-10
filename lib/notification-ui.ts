import type { NotificationCategory } from '@/types/notifications';
import type { SemanticTone } from '@/lib/semantic-tokens';

export function getNotificationTone(category: NotificationCategory): SemanticTone {
  switch (category) {
    case 'ACCOUNT':
      return 'brand';
    case 'VAULT':
      return 'info';
    case 'POINTS':
      return 'success';
    case 'ON_CHAIN':
      return 'chain';
    case 'REWARDS':
      return 'brand';
    case 'SECURITY':
      return 'danger';
    case 'SYSTEM':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export const notificationCategoryLabels: Record<NotificationCategory, string> = {
  ACCOUNT: 'Account',
  VAULT: 'Vaults',
  POINTS: 'Points',
  ON_CHAIN: 'On-chain',
  REWARDS: 'Rewards',
  SECURITY: 'Security',
  SYSTEM: 'System',
};

export function getNotificationIcon(category: NotificationCategory) {
  switch (category) {
    case 'ACCOUNT':
      return 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M19 8v6M22 11h-6';
    case 'VAULT':
      return 'M2 7h20v14H2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2';
    case 'POINTS':
      return 'M3 3v18h18M7 16l4-4 4 4 5-6';
    case 'ON_CHAIN':
      return 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z';
    case 'REWARDS':
      return 'M3 8h18v13H3zM12 8V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3';
    case 'SECURITY':
      return 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z';
    default:
      return 'M12 16v-4m0-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z';
  }
}
