import type { AppUserVerificationStatus } from '@/lib/domain';
import type { PointsTransactionView } from '@/types/vault';

export type AccountProfileView = {
  displayName: string | null;
  email: string | null;
  referralCode: string | null;
  verificationStatus: AppUserVerificationStatus;
  memberSince: string;
  stats: {
    lockedBalance: number;
    availablePoints: number;
    activeVaults: number;
    totalVaults: number;
  };
  recentActivity: PointsTransactionView[];
};

export type AccountPreferences = {
  emailProductUpdates: boolean;
  emailPointsEarned: boolean;
  emailVaultMaturity: boolean;
  emailReferralActivity: boolean;
  pushEnabled: boolean;
  profileVisibility: 'private' | 'friends';
  shareAnalytics: boolean;
};

export const defaultAccountPreferences: AccountPreferences = {
  emailProductUpdates: true,
  emailPointsEarned: true,
  emailVaultMaturity: true,
  emailReferralActivity: false,
  pushEnabled: false,
  profileVisibility: 'private',
  shareAnalytics: true,
};
