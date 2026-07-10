import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'app/page.tsx',
  'app/create-vault/page.tsx',
  'app/vaults/[id]/page.tsx',
  'app/vaults/[id]/vault-detail-client.tsx',
  'pages/api/health.ts',
  'pages/api/vaults/index.ts',
  'pages/api/vaults/[id].ts',
  'pages/api/vaults/[id]/mark-top-up.ts',
  'pages/api/vaults/[id]/claim-reward.ts',
  'pages/api/vaults/[id]/create-stellar-proof.ts',
  'services/vault-service.ts',
  'services/top-up-service.ts',
  'services/reward-service.ts',
  'services/voucher-service.ts',
  'services/stellar-proof-service.ts',
  'services/config-service.ts',
  'lib/api-client.ts',
  'lib/api-methods.ts',
  'lib/domain.ts',
  'lib/status-labels.ts',
  'components/ui/stepper.tsx',
  'prisma/schema.prisma',
  'prisma/seed.ts',
  'prisma/migrations/migration_lock.toml',
  'prisma/migrations/20260710000000_fresh_schema/migration.sql',
  'docs/project-plan.md',
  'docs/implementation-checklist.md',
  'docs/demo-script.md',
  'docs/recommended-concept-and-pitch.md',
  'docs/engineering-loop-report.md',
  'docs/qa-report.md',
  'README.md',
];

const uiFilesToScan = [
  'app/page.tsx',
  'app/create-vault/page.tsx',
  'app/vaults/[id]/vault-detail-client.tsx',
  'components/layout/public-layout.tsx',
  'components/ui/stepper.tsx',
  'components/vault/create-vault-form.tsx',
  'components/vault/reward-card.tsx',
  'components/vault/reward-timeline.tsx',
  'components/vault/stellar-proof-card.tsx',
  'components/vault/top-up-schedule.tsx',
  'components/vault/unlock-card.tsx',
  'components/vault/vault-summary-card.tsx',
];

const contrastProblemPatterns = [
  /bg-white[^'\n]*text-white/,
  /text-white[^'\n]*bg-white/,
  /bg-white\/[^'\n]*text-white/,
  /text-white[^'\n]*bg-white\//,
];

const bannedUiPatterns = [
  /gambling app/i,
  /non-gambling gambling/i,
  /betting/i,
  /arcade/i,
  /tickets?/i,
  /casino/i,
  /random rewards?/i,
  /rehab treatment/i,
  /medical treatment/i,
  /guaranteed yield/i,
  /investment product/i,
  /lorem ipsum/i,
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
      failures.push(`Banned or unsafe UI wording found in ${file}: ${pattern}`);
    }
  }

  for (const pattern of contrastProblemPatterns) {
    if (pattern.test(content)) {
      failures.push(`Potential white-on-white contrast issue found in ${file}: ${pattern}`);
    }
  }
}

const demoConfig = readFileSync(join(root, 'lib/demo-config.ts'), 'utf8');
if (!demoConfig.includes('demoPublicKey')) {
  failures.push('Missing non-technical demo public key helper in lib/demo-config.ts');
}

const createVaultForm = readFileSync(join(root, 'components/vault/create-vault-form.tsx'), 'utf8');
for (const requiredCopy of ['Use demo testnet address', 'Guided setup', 'Step {progressLabel}', 'Never paste a secret key']) {
  if (!createVaultForm.includes(requiredCopy)) {
    failures.push(`Create vault form is missing UX helper copy: ${requiredCopy}`);
  }
}

const forbiddenFiles = [
  'pages/index.tsx',
  'pages/create-vault.tsx',
  'pages/vaults/[id].tsx',
  'app/api/health/route.ts',
  'app/api/vaults/route.ts',
];

for (const file of forbiddenFiles) {
  if (existsSync(join(root, file))) {
    failures.push(`Architecture violation found: ${file}`);
  }
}

const schema = readFileSync(join(root, 'prisma/schema.prisma'), 'utf8');
for (const model of ['model AppConfig', 'model AppUser', 'model Vault', 'model TopUp', 'model RewardClaim', 'model ProofReceipt']) {
  if (!schema.includes(model)) {
    failures.push(`Missing Prisma schema block: ${model}`);
  }
}


const migrationSql = readFileSync(join(root, 'prisma/migrations/20260710000000_fresh_schema/migration.sql'), 'utf8');
for (const requiredTable of ['"AppUser"', '"Vault"', '"TopUp"', '"RewardClaim"', '"ProofReceipt"']) {
  if (!migrationSql.includes(`CREATE TABLE ${requiredTable}`)) {
    failures.push(`Fresh baseline migration is missing table: ${requiredTable}`);
  }
}

const packageJson = readFileSync(join(root, 'package.json'), 'utf8');
for (const script of ['verify:mvp', 'check', 'build:next', 'db:reset:force']) {
  if (!packageJson.includes(`"${script}"`)) {
    failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error('MVP verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('MVP verification passed. Required files exist and UI wording scan is clean.');
