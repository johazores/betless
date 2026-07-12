/**
 * Demo data seeder. Creates backdated vaults for an existing user so the
 * dashboard, points, rewards, and on-chain verification are populated:
 *
 * - a vault started 5 months ago (points accrued, lock verified on Stellar);
 * - a vault started 13 months ago with a 12-month lock (matures — and its
 *   on-chain balance is claimed — the first time the dashboard loads).
 *
 * Points themselves appear via lazy accrual on the next dashboard read.
 *
 * Usage:
 *   npm run demo:seed              # seeds the most recently created user, or a demo user if none exists
 *   npm run demo:seed -- <email>   # seeds this user, creating a demo profile if needed
 */
import { addMonths } from '../lib/dates';
import { VaultStatus } from '../lib/domain';
import { prisma } from '../lib/prisma';
import { StellarService } from '../services/stellar-service';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const fallbackEmail = 'demo.admin@betless.local';

  let user = email
    ? await prisma.appUser.findFirst({ where: { email } })
    : await prisma.appUser.findFirst({ orderBy: { createdAt: 'desc' } });

  if (!user) {
    const demoEmail = email ?? fallbackEmail;
    user = await prisma.appUser.upsert({
      where: { clerkUserId: `demo-seed-${demoEmail}` },
      create: {
        clerkUserId: `demo-seed-${demoEmail}`,
        email: demoEmail,
        displayName: 'Demo Admin User',
        lastSeenAt: new Date(),
      },
      update: {
        email: demoEmail,
        displayName: 'Demo Admin User',
        lastSeenAt: new Date(),
      },
    });
  }

  console.log(`Seeding demo vaults for ${user.email ?? user.clerkUserId}...`);
  console.log(`Stellar on-chain locks: ${StellarService.isEnabled() ? 'enabled' : 'disabled (no env config)'}\n`);

  const now = new Date();

  const inProgressStart = addMonths(now, -5);
  const inProgress = await prisma.vault.upsert({
    where: { idempotencyKey: `demo-in-progress-${user.id}` },
    create: {
      appUserId: user.id,
      principal: 50_000,
      lockMonths: 12,
      goalName: 'College fund',
      startAt: inProgressStart,
      maturesAt: addMonths(inProgressStart, 12),
      idempotencyKey: `demo-in-progress-${user.id}`,
    },
    update: {
      principal: 50_000,
      lockMonths: 12,
      goalName: 'College fund',
      status: VaultStatus.ACTIVE,
      startAt: inProgressStart,
      maturesAt: addMonths(inProgressStart, 12),
      closedAt: null,
      withdrawalFee: null,
      returnedAmount: null,
    },
  });
  console.log(`Created in-progress vault (₱50,000, month 5 of 12): ${inProgress.id}`);
  await StellarService.lockVaultPrincipal(inProgress);

  const remittanceStart = addMonths(now, -2);
  const remittance = await prisma.vault.upsert({
    where: { idempotencyKey: `demo-remittance-${user.id}` },
    create: {
      appUserId: user.id,
      principal: 6_000,
      lockMonths: 12,
      goalName: 'Tuition',
      sourceAmount: 20_000,
      lockPercent: 30,
      startAt: remittanceStart,
      maturesAt: addMonths(remittanceStart, 12),
      idempotencyKey: `demo-remittance-${user.id}`,
    },
    update: {
      principal: 6_000,
      lockMonths: 12,
      goalName: 'Tuition',
      sourceAmount: 20_000,
      lockPercent: 30,
      status: VaultStatus.ACTIVE,
      startAt: remittanceStart,
      maturesAt: addMonths(remittanceStart, 12),
      closedAt: null,
      withdrawalFee: null,
      returnedAmount: null,
    },
  });
  console.log(`Created remittance-split vault (₱6,000 locked from ₱20,000): ${remittance.id}`);
  await StellarService.lockVaultPrincipal(remittance);

  const maturedStart = addMonths(now, -13);
  const matured = await prisma.vault.upsert({
    where: { idempotencyKey: `demo-matured-${user.id}` },
    create: {
      appUserId: user.id,
      principal: 25_000,
      lockMonths: 12,
      startAt: maturedStart,
      maturesAt: addMonths(maturedStart, 12),
      idempotencyKey: `demo-matured-${user.id}`,
    },
    update: {
      principal: 25_000,
      lockMonths: 12,
      status: VaultStatus.ACTIVE,
      startAt: maturedStart,
      maturesAt: addMonths(maturedStart, 12),
      closedAt: null,
      withdrawalFee: null,
      returnedAmount: null,
    },
  });
  console.log(`Created past-maturity vault (₱25,000, will settle on next dashboard load): ${matured.id}`);
  await StellarService.lockVaultPrincipal(matured);

  const locks = await prisma.stellarOperation.findMany({
    where: { vaultId: { in: [inProgress.id, remittance.id, matured.id] } },
  });
  for (const lock of locks) {
    console.log(`  on-chain ${lock.kind} for ${lock.vaultId}: ${lock.state}${lock.errorMessage ? ` (${lock.errorMessage})` : ''}`);
  }

  console.log('\nDone. Open the dashboard — points accrue and the matured vault settles on first load.');
}

main()
  .catch((error) => {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
