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
  'lib/vault-rules.ts',
  'lib/rewards.ts',
  'lib/validators.ts',
  'lib/auth.ts',
  'components/layout/nav-summary.tsx',
  'prisma/schema.prisma',
  'proxy.ts',
  'README.md',
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
  /stellar/i,
  /wallet address/i,
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
for (const block of ['model AppUser', 'model Vault', 'model PointsTransaction', 'enum VaultStatus', 'enum PointsTransactionType']) {
  if (!schema.includes(block)) {
    failures.push(`Missing Prisma schema block: ${block}`);
  }
}

const rules = readFileSync(join(root, 'lib/vault-rules.ts'), 'utf8');
for (const rule of ['MIN_DEPOSIT_PHP = 10_000', 'ANNUAL_REWARD_RATE = 0.04', 'FLAT_WITHDRAWAL_FEE_PHP = 500', 'FLAT_FEE_PRINCIPAL_LIMIT_PHP = 50_000', 'LOCK_MONTH_INCREMENT = 12']) {
  if (!rules.includes(rule)) {
    failures.push(`Business rule constant is missing or changed: ${rule}`);
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
