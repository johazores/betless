import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'app/page.tsx',
  'app/create-vault/page.tsx',
  'app/dashboard/dashboard-client.tsx',
  'app/vaults/[id]/page.tsx',
  'app/vaults/[id]/vault-detail-client.tsx',
  'app/rewards/rewards-client.tsx',
  'pages/api/health.ts',
  'pages/api/summary.ts',
  'pages/api/vaults/index.ts',
  'pages/api/vaults/[id].ts',
  'pages/api/vaults/[id]/withdraw.ts',
  'pages/api/points/index.ts',
  'pages/api/rewards/redeem.ts',
  'services/vault-service.ts',
  'services/points-service.ts',
  'services/user-service.ts',
  'services/stellar-service.ts',
  'lib/stellar-config.ts',
  'scripts/setup-stellar-testnet.mjs',
  'scripts/audit-instawards.mjs',
  'lib/vault-rules.ts',
  'lib/rewards.ts',
  'lib/validators.ts',
  'lib/auth.ts',
  'lib/admin-crypto.ts',
  'lib/admin-permissions.ts',
  'services/admin-auth-service.ts',
  'services/admin-platform-service.ts',
  'services/managed-config-service.ts',
  'app/admin/page.tsx',
  'app/admin/login/page.tsx',
  'pages/api/admin/auth/login.ts',
  'pages/api/admin/analytics.ts',
  'pages/api/admin/config/index.ts',
  'components/layout/nav-summary.tsx',
  'prisma/schema.prisma',
  'prisma.config.ts',
  'proxy.ts',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'docs/instawards-evidence.md',
  '.github/workflows/ci.yml',
  'tests/vault-rules.test.ts',
  'tests/stellar-config.test.ts',
];

const uiFilesToScan = [
  'app/page.tsx',
  'app/create-vault/page.tsx',
  'app/dashboard/dashboard-client.tsx',
  'app/vaults/[id]/vault-detail-client.tsx',
  'app/rewards/rewards-client.tsx',
  'components/layout/public-layout.tsx',
  'components/layout/nav-summary.tsx',
  'components/marketing/how-it-works.tsx',
  'components/vault/create-vault-form.tsx',
  'components/vault/vault-card.tsx',
];

const bannedUiPatterns = [
  /gambling/i,
  /betting/i,
  /casino/i,
  /guaranteed yield/i,
  /investment product/i,
  /wallet address/i,
  /secret key/i,
  /top-up/i,
  /lorem ipsum/i,
  /\bTODO\b/,
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

for (const file of uiFilesToScan) {
  const path = join(root, file);
  if (!existsSync(path)) continue;

  const content = readFileSync(path, 'utf8');
  for (const pattern of bannedUiPatterns) {
    if (pattern.test(content)) {
      failures.push(`Banned or obsolete wording found in ${file}: ${pattern}`);
    }
  }
}

const schema = readFileSync(join(root, 'prisma/schema.prisma'), 'utf8');
for (const block of ['model AppUser', 'model Vault', 'model PointsTransaction', 'model StellarOperation', 'enum VaultStatus', 'enum PointsTransactionType']) {
  if (!schema.includes(block)) {
    failures.push(`Missing Prisma schema block: ${block}`);
  }
}

for (const block of ['model AdminUser', 'model AdminRefreshToken', 'model AdminAuditLog', 'model FeatureFlag', 'model ManagedConfig', 'enum AdminRole', 'ADMIN_ADJUSTMENT']) {
  if (!schema.includes(block)) {
    failures.push(`Missing admin schema block or enum value: ${block}`);
  }
}

const adminAuth = readFileSync(join(root, 'services/admin-auth-service.ts'), 'utf8');
for (const marker of ['signAdminJwt', 'adminRefreshToken', 'ADMIN_BOOTSTRAP_EMAIL', 'requireAdmin']) {
  if (!adminAuth.includes(marker)) {
    failures.push(`Admin auth marker missing: ${marker}`);
  }
}

const managedConfig = readFileSync(join(root, 'services/managed-config-service.ts'), 'utf8');
for (const marker of ['encryptConfigValue', 'DATABASE_URL', 'bootCritical', 'STELLAR_TREASURY_SECRET']) {
  if (!managedConfig.includes(marker)) {
    failures.push(`Managed config marker missing: ${marker}`);
  }
}

const rules = readFileSync(join(root, 'lib/vault-rules.ts'), 'utf8');
for (const rule of ['MIN_DEPOSIT_PHP = 10_000', 'ANNUAL_REWARD_RATE = 0.04', 'FLAT_WITHDRAWAL_FEE_PHP = 500', 'FLAT_FEE_PRINCIPAL_LIMIT_PHP = 50_000', 'LOCK_MONTH_INCREMENT = 12']) {
  if (!rules.includes(rule)) {
    failures.push(`Business rule constant is missing or changed: ${rule}`);
  }
}

const stellarService = readFileSync(join(root, 'services/stellar-service.ts'), 'utf8');
for (const behavior of [
  'Operation.createClaimableBalance',
  'Operation.claimClaimableBalance',
  'predicateBeforeAbsoluteTime',
  'transaction.toXDR()',
  '.setTimeout(',
]) {
  if (!stellarService.includes(behavior)) {
    failures.push(`Stellar settlement behavior is missing: ${behavior}`);
  }
}

if (failures.length > 0) {
  console.error('Product verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Product verification passed. Required files exist and business rules are intact.');
