import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function requireFile(relativePath) {
  if (!existsSync(join(root, relativePath))) {
    failures.push(`Missing ${relativePath}`);
    return false;
  }
  return true;
}

for (const file of [
  'LICENSE',
  'README.md',
  'SECURITY.md',
  'docs/instawards-evidence.md',
  'docs/instawards-test-plan.md',
  'docs/stellar-architecture.md',
  'services/stellar-service.ts',
  'services/transparency-service.ts',
  'scripts/configure-early-exit-multisig.mjs',
  'scripts/smoke-stellar.ts',
  '.github/workflows/ci.yml',
]) {
  requireFile(file);
}

if (existsSync(join(root, 'LICENSE')) && !read('LICENSE').startsWith('MIT License')) {
  failures.push('Root LICENSE is not the MIT license');
}

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

for (const path of trackedFiles) {
  const isSecretEnvironmentFile = path === '.env' || (/^\.env\..+/.test(path) && path !== '.env.example');
  if (existsSync(join(root, path)) && (isSecretEnvironmentFile || path.endsWith('.tsbuildinfo'))) {
    failures.push(`Generated or secret-bearing file must not be tracked: ${path}`);
  }
}

const stellar = read('services/stellar-service.ts');
for (const required of [
  'Operation.createClaimableBalance',
  'Operation.claimClaimableBalance',
  'Claimant.predicateNot',
  'Claimant.predicateBeforeAbsoluteTime',
  'transaction.toXDR()',
  'transaction.hash()',
  '.setTimeout(',
]) {
  if (!stellar.includes(required)) failures.push(`Missing Stellar evidence in code: ${required}`);
}

const multisig = read('scripts/configure-early-exit-multisig.mjs');
for (const required of ['lowThreshold: 2', 'medThreshold: 2', 'highThreshold: 2', 'weight: 1']) {
  if (!multisig.includes(required)) failures.push(`Missing 2-of-3 policy evidence: ${required}`);
}

const exampleEnvironment = read('.env.example');
for (const prohibited of [
  'ADMIN_BOOTSTRAP_PASSWORD="Admin@123"',
  'ADMIN_JWT_SECRET="5d4b1c9f',
  'ADMIN_CONFIG_ENCRYPTION_KEY="c8e4f1a7',
]) {
  if (exampleEnvironment.includes(prohibited)) {
    failures.push(`Example environment contains a reusable credential value: ${prohibited}`);
  }
}

const evidence = read('docs/instawards-evidence.md');
for (const prohibited of ['available on request', 'guaranteed approval', 'fully decentralized']) {
  if (evidence.toLowerCase().includes(prohibited)) {
    failures.push(`Evidence register contains unsupported wording: ${prohibited}`);
  }
}
if (!evidence.includes('Known gaps')) failures.push('Evidence register must disclose known gaps');
if (!evidence.includes('low threshold must be 2')) {
  failures.push('Evidence register must explain the low-threshold requirement for claimable-balance claims');
}

const commits = Number(execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim());
if (commits < 5) failures.push(`Repository history is too thin (${commits} commits)`);

const stellarCommits = execFileSync(
  'git',
  ['log', '--format=%H', '--', 'services/stellar-service.ts', 'lib/stellar-config.ts', 'scripts/smoke-stellar.ts'],
  { cwd: root, encoding: 'utf8' },
).split(/\r?\n/).filter(Boolean).length;
if (stellarCommits < 1) failures.push('No committed Stellar-specific development history found');

warnings.push('Frontend and backend remain in one public monorepo; confirm this structure with the Chapter Lead.');
warnings.push('No Soroban contract repository is expected because Betless uses native claimable balances.');
warnings.push('The multisignature setup script configures policy only; the separated approval workflow remains a sprint deliverable.');
warnings.push('Public transaction receipts and Chapter Lead verification still require external evidence.');

if (failures.length) {
  console.error('Instawards repository audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Instawards repository audit passed (${commits} commits; ${stellarCommits} Stellar-specific commits).`);
for (const warning of warnings) console.log(`- Note: ${warning}`);
