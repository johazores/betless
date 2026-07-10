import { AdminPermission } from '@/lib/admin-permissions';
import type { AdminTab } from '@/components/layout/admin-layout';

export type AdminProfile = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
};

export type AnalyticsData = {
  metrics: Record<string, number>;
  userGrowth: Array<{ date: string; registrations: number }>;
  environment: Record<string, unknown>;
};

export type UserRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  status: string;
  verificationStatus: string;
  createdAt: string;
  lastSeenAt: string | null;
  lockedBalance: number;
  pointsBalance: number;
};

export type Paginated<T> = {
  total: number;
  page: number;
  pageSize: number;
} & T;

export const TAB_PERMISSIONS: Record<AdminTab, string> = {
  dashboard: AdminPermission.VIEW_DASHBOARD,
  users: AdminPermission.VIEW_USERS,
  points: AdminPermission.MANAGE_POINTS,
  chain: AdminPermission.VIEW_ON_CHAIN,
  config: AdminPermission.MANAGE_CONFIG,
  flags: AdminPermission.MANAGE_CONFIG,
  audit: AdminPermission.VIEW_AUDIT_LOGS,
  admins: AdminPermission.MANAGE_ADMINS,
};

export const TAB_LABELS: Record<AdminTab, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  points: 'Points',
  chain: 'On-chain',
  config: 'Configuration',
  flags: 'Feature flags',
  audit: 'Audit logs',
  admins: 'Administrators',
};

export function formatNumber(value: number) {
  return value.toLocaleString('en-PH');
}

export function formatPeso(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}
