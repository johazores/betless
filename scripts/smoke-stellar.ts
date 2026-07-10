/** One-shot smoke test for the Stellar settlement layer (testnet). */
import { prisma } from '../lib/prisma';
import { StellarService } from '../services/stellar-service';
import { addMonths } from '../lib/dates';

async function main() {
  console.log('Stellar enabled:', StellarService.isEnabled());

  const user = await prisma.appUser.upsert({
    where: { clerkUserId: 'smoke-test-user' },
    update: {},
    create: { clerkUserId: 'smoke-test-user', email: 'smoke@test.local' },
  });

  const startAt = new Date();
  const vault = await prisma.vault.create({
    data: {
      appUserId: user.id,
      principal: 10000,
      lockMonths: 12,
      startAt,
      maturesAt: addMonths(startAt, 12),
    },
  });
  console.log('Vault created:', vault.id);

  console.log('Locking principal on-chain...');
  await StellarService.lockVaultPrincipal(vault);

  const afterLock = await prisma.vault.findUniqueOrThrow({
    where: { id: vault.id },
    include: { stellarOperations: true },
  });
  console.log('claimableBalanceId:', afterLock.claimableBalanceId);
  for (const op of afterLock.stellarOperations) {
    console.log(`  op ${op.kind}: ${op.state} tx=${op.txHash} err=${op.errorMessage ?? '-'}`);
  }

  if (!afterLock.claimableBalanceId) throw new Error('Lock failed');

  console.log('Releasing early (ops claims + settles back to treasury)...');
  await StellarService.releaseVaultPrincipal(afterLock, 'CLAIM_EARLY');

  const afterRelease = await prisma.vault.findUniqueOrThrow({
    where: { id: vault.id },
    include: { stellarOperations: true },
  });
  for (const op of afterRelease.stellarOperations) {
    console.log(`  op ${op.kind}: ${op.state} tx=${op.txHash} err=${op.errorMessage ?? '-'}`);
  }

  console.log('View:', JSON.stringify(StellarService.toStellarView(afterRelease), null, 2));

  await prisma.vault.delete({ where: { id: vault.id } });
  await prisma.appUser.delete({ where: { id: user.id } });
  console.log('Cleaned up. Smoke test passed.');
}

main()
  .catch((error) => {
    console.error('Smoke test failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
