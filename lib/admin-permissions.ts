import { AdminRole, type AdminRole as AdminRoleType } from '@/lib/domain';

export const AdminPermission = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_USERS: 'VIEW_USERS',
  MANAGE_POINTS: 'MANAGE_POINTS',
  VIEW_ON_CHAIN: 'VIEW_ON_CHAIN',
  RETRY_ON_CHAIN: 'RETRY_ON_CHAIN',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_CONFIG: 'MANAGE_CONFIG',
  MANAGE_ADMINS: 'MANAGE_ADMINS',
} as const;

export type AdminPermission = (typeof AdminPermission)[keyof typeof AdminPermission];

const rolePermissions: Record<AdminRoleType, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
  [AdminRole.ADMIN]: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_USERS,
    AdminPermission.MANAGE_POINTS,
    AdminPermission.VIEW_ON_CHAIN,
    AdminPermission.RETRY_ON_CHAIN,
    AdminPermission.VIEW_AUDIT_LOGS,
    AdminPermission.MANAGE_CONFIG,
  ],
  [AdminRole.SUPPORT]: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_USERS,
    AdminPermission.MANAGE_POINTS,
    AdminPermission.VIEW_ON_CHAIN,
  ],
  [AdminRole.READ_ONLY]: [
    AdminPermission.VIEW_DASHBOARD,
    AdminPermission.VIEW_USERS,
    AdminPermission.VIEW_ON_CHAIN,
    AdminPermission.VIEW_AUDIT_LOGS,
  ],
};

export function getAdminPermissions(role: string): AdminPermission[] {
  return rolePermissions[role as AdminRoleType] ?? [];
}

export function hasAdminPermission(role: string, permission: AdminPermission) {
  return getAdminPermissions(role).includes(permission);
}
