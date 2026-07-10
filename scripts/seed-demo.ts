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
 *   npm run demo:seed              # seeds the most recently created user
 *   npm run demo:seed -- <email>   # seeds the user with this email
 */
import { addMonths } from '../lib/dates';
import { prisma } from '../lib/prisma';
import { StellarService } from '../services/stellar-service';

async function main() {
  const email = process.argv[2];

  const user = email
    ? await prisma.appUser.findFirst({ where: { email } })
    : await prisma.appUser.findFirst({ orderBy: { createdAt: 'desc' } });

  if (!user) {
    throw new Error(
      email
        ? `No user found with email ${email}. Sign up in the app first.`
        : 'No users found. Sign up in the app first, then rerun this script.',
    );
  }

  console.log(`Seeding demo vaults for ${user.email ?? user.clerkUserId}...`);
  console.log(`Stellar on-chain locks: ${StellarService.isEnabled() ? 'enabled' : 'disabled (no env config)'}\n`);

  const now = new Date();

  const inProgressStart = addMonths(now, -5);
  const inProgress = await prisma.vault.create({
    data: {
      appUserId: user.id,
      principal: 50_000,
      lockMonths: 12,
      startAt: inProgressStart,
      maturesAt: addMonths(inProgressStart, 12),
    },
  });
  console.log(`Created in-progress vault (₱50,000, month 5 of 12): ${inProgress.id}`);
  await StellarService.lockVaultPrincipal(inProgress);

  const maturedStart = addMonths(now, -13);
  const matured = await prisma.vault.create({
    data: {
      appUserId: user.id,
      principal: 25_000,
      lockMonths: 12,
      startAt: maturedStart,
      maturesAt: addMonths(maturedStart, 12),
    },
  });
  console.log(`Created past-maturity vault (₱25,000, will settle on next dashboard load): ${matured.id}`);
  await StellarService.lockVaultPrincipal(matured);

  const locks = await prisma.stellarOperation.findMany({
    where: { vaultId: { in: [inProgress.id, matured.id] } },
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
