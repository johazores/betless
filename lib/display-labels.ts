import { adminRoleLabels } from '@/lib/admin-permissions';

/**
 * Converts internal identifiers (snake_case, camelCase, SCREAMING_SNAKE_CASE)
 * into human-readable title case labels.
 */
export function humanizeIdentifier(value: string): string {
  if (!value) return '';

  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return spaced
    .split(/\s+/)
    .map((word) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export type DisplayLabelContext =
  | 'generic'
  | 'adminRole'
  | 'auditAction'
  | 'userStatus'
  | 'verificationStatus'
  | 'vaultStatus'
  | 'pointsTransactionType'
  | 'stellarOperationKind'
  | 'stellarOperationState'
  | 'configKey'
  | 'configSource'
  | 'environmentKey'
  | 'metricKey'
  | 'targetType';

const userStatusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  CLOSED: 'Closed',
};

const verificationStatusLabels: Record<string, string> = {
  UNVERIFIED: 'Unverified',
  PENDING: 'Pending review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

const vaultStatusLabels: Record<string, string> = {
  ACTIVE: 'Locked',
  MATURED: 'Matured',
  WITHDRAWN_EARLY: 'Withdrawn early',
};

const pointsTransactionTypeLabels: Record<string, string> = {
  MONTHLY_REWARD: 'Monthly reward',
  REDEMPTION: 'Redemption',
  REFERRAL_BONUS: 'Referral bonus',
  ADMIN_ADJUSTMENT: 'Admin adjustment',
};

const stellarOperationKindLabels: Record<string, string> = {
  LOCK: 'Lock deposit',
  CLAIM: 'Claim maturity',
  EARLY_WITHDRAW: 'Early withdrawal',
};

const stellarOperationStateLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  FAILED: 'Failed',
};

const auditActionLabels: Record<string, string> = {
  POINTS_ADJUSTED: 'Points adjusted',
  POINTS_BULK_ADJUSTED: 'Bulk points adjustment',
  USER_STATUS_UPDATED: 'User status updated',
  ADMIN_LOGIN: 'Admin signed in',
  ADMIN_LOGIN_FAILED: 'Sign-in failed',
  ADMIN_LOGOUT: 'Admin signed out',
  ADMIN_CREATED: 'Administrator created',
  ADMIN_UPDATED: 'Administrator updated',
  ADMIN_DEACTIVATED: 'Administrator deactivated',
  ADMIN_PASSWORD_RESET: 'Password reset',
  CONFIG_UPDATED: 'Configuration updated',
  CONFIG_RESET: 'Configuration reset',
  FEATURE_FLAG_UPDATED: 'Feature flag updated',
  FEATURE_FLAG_DELETED: 'Feature flag deleted',
  STELLAR_OPERATION_RETRIED: 'On-chain operation retried',
};

const configKeyLabels: Record<string, string> = {
  APP_ENV_LABEL: 'App environment label',
  STELLAR_NETWORK: 'Stellar network',
  STELLAR_ASSET_CODE: 'Settlement asset code',
  STELLAR_ASSET_ISSUER: 'Settlement asset issuer',
  STELLAR_HORIZON_URL: 'Horizon URL',
  STELLAR_TREASURY_SECRET: 'Treasury signer secret',
  STELLAR_OPS_SECRET: 'Operations signer secret',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: 'Sign-in URL',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: 'Sign-up URL',
  DATABASE_URL: 'Database connection',
  ADMIN_JWT_SECRET: 'Admin JWT secret',
  ADMIN_CONFIG_ENCRYPTION_KEY: 'Config encryption key',
};

const configSourceLabels: Record<string, string> = {
  managed: 'Managed override',
  process: 'Environment variable',
  unset: 'Not configured',
};

const environmentKeyLabels: Record<string, string> = {
  nodeEnv: 'Application environment',
  vercelEnv: 'Deployment',
  stellarNetwork: 'Stellar network',
  stellarEnabled: 'Stellar integration',
  horizonUrl: 'Horizon endpoint',
};

const metricKeyLabels: Record<string, string> = {
  totalUsers: 'Total users',
  activeUsers: 'Active users',
  activeVaults: 'Active vaults',
  allVaults: 'Total vaults',
  lockedBalance: 'Locked balance',
  pointsIssued: 'Points issued',
  pointsRedeemed: 'Points redeemed',
  stellarOps: 'On-chain operations',
  failedOps: 'Failed operations',
};

const targetTypeLabels: Record<string, string> = {
  USER: 'User',
  ADMIN: 'Administrator',
  CONFIG: 'Configuration',
  FEATURE_FLAG: 'Feature flag',
  STELLAR_OPERATION: 'On-chain operation',
  APP_USER: 'User',
};

const contextMaps: Record<DisplayLabelContext, Record<string, string>> = {
  generic: {},
  adminRole: adminRoleLabels,
  auditAction: auditActionLabels,
  userStatus: userStatusLabels,
  verificationStatus: verificationStatusLabels,
  vaultStatus: vaultStatusLabels,
  pointsTransactionType: pointsTransactionTypeLabels,
  stellarOperationKind: stellarOperationKindLabels,
  stellarOperationState: stellarOperationStateLabels,
  configKey: configKeyLabels,
  configSource: configSourceLabels,
  environmentKey: environmentKeyLabels,
  metricKey: metricKeyLabels,
  targetType: targetTypeLabels,
};

export function getDisplayLabel(
  value: string | null | undefined,
  context: DisplayLabelContext = 'generic',
): string {
  if (value == null || value === '') return '—';

  const mapped = contextMaps[context][value];
  if (mapped) return mapped;

  return humanizeIdentifier(value);
}

export function enumToSelectOptions<T extends string>(
  values: readonly T[],
  context: DisplayLabelContext,
): Array<{ label: string; value: T }> {
  return values.map((value) => ({
    label: getDisplayLabel(value, context),
    value,
  }));
}

export function formatDisplayValue(value: unknown, key?: string): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
  if (typeof value === 'string' && key === 'nodeEnv') {
    if (value === 'development') return 'Local';
    if (value === 'production') return 'Production';
    if (value === 'test') return 'Quality assurance';
  }
  if (typeof value === 'string' && key === 'vercelEnv') {
    if (value === 'production') return 'Production';
    if (value === 'preview') return 'Preview';
    if (value === 'development') return 'Local';
  }
  if (typeof value === 'string' && key === 'stellarNetwork') {
    if (value === 'testnet' || value === 'TESTNET') return 'Staging network';
    if (value === 'public' || value === 'PUBLIC') return 'Live network';
  }
  return String(value);
}

/** @deprecated Use getDisplayLabel(value, 'vaultStatus') */
export function getVaultStatusLabel(status: string) {
  return getDisplayLabel(status, 'vaultStatus');
}
