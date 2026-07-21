/** One-shot smoke test for the current Stellar settlement layer on testnet. */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { StellarOperation } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { StellarService } from '../services/stellar-service';
import { addMonths } from '../lib/dates';
import { buildTransactionExplorerUrl, getStellarNetwork } from '../lib/stellar-config';

const outputPath = resolve(process.env.INSTAWARDS_RECEIPT_OUTPUT ?? 'artifacts/betless-baseline-receipts.json');
const preserveRows = process.env.PRESERVE_STELLAR_SMOKE === '1';

async function main() {
  if (!StellarService.isEnabled()) {
    throw new Error('Stellar settlement is not configured.');
  }
  if (getStellarNetwork() !== 'TESTNET') {
    throw new Error('The evidence smoke test is restricted to Stellar testnet.');
  }

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

  if (!afterLock.claimableBalanceId) throw new Error('Lock did not produce a claimable-balance ID.');
  const lock = afterLock.stellarOperations.find((operation: StellarOperation) => operation.kind === 'LOCK');
  if (!lock?.txHash || lock.state !== 'CONFIRMED') {
    throw new Error(`Lock did not confirm: ${lock?.state ?? 'missing operation'}`);
  }

  console.log('Releasing early through the current ops claimant...');
  await StellarService.releaseVaultPrincipal(afterLock, 'CLAIM_EARLY');

  const afterRelease = await prisma.vault.findUniqueOrThrow({
    where: { id: vault.id },
    include: { stellarOperations: { orderBy: { createdAt: 'asc' } } },
  });
  const release = afterRelease.stellarOperations.find(
    (operation: StellarOperation) => operation.kind === 'CLAIM_EARLY',
  );
  if (!release?.txHash || release.state !== 'CONFIRMED') {
    throw new Error(`Early release did not confirm: ${release?.state ?? 'missing operation'}`);
  }

  const manifest = {
    project: 'Betless',
    purpose: 'Current single-key baseline before the proposed multisignature sprint',
    network: 'Stellar testnet',
    generatedAt: new Date().toISOString(),
    vaultId: vault.id,
    claimableBalanceId: afterRelease.claimableBalanceId,
    receipts: afterRelease.stellarOperations
      .filter((operation: StellarOperation) => operation.txHash)
      .map((operation: StellarOperation) => ({
        kind: operation.kind,
        state: operation.state,
        transactionHash: operation.txHash,
        explorerUrl: buildTransactionExplorerUrl(operation.txHash!),
        claimableBalanceId: operation.claimableBalanceId,
        createdAt: operation.createdAt.toISOString(),
      })),
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log('Receipt manifest:', outputPath);

  if (preserveRows) {
    console.log('Evidence rows preserved:', vault.id);
  } else {
    await prisma.vault.delete({ where: { id: vault.id } });
    await prisma.appUser.delete({ where: { id: user.id } });
    console.log('Temporary database rows removed. On-chain receipts remain public.');
  }

  console.log('Smoke test passed.');
}

main()
  .catch((error) => {
    console.error('Smoke test failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
