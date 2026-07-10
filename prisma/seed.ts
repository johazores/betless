import { Keypair } from '@stellar/stellar-sdk';
import { TopUpFrequency, VaultMode } from '../lib/domain';
import { createVaultAccessToken, hashVaultAccessToken } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { VaultService } from '../services/vault-service';

async function main() {
  await prisma.activityEvent.deleteMany();
  await prisma.proofReceipt.deleteMany();
  await prisma.rewardClaim.deleteMany();
  await prisma.topUp.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.appUser.deleteMany();
  await prisma.appConfig.upsert({
    where: { key: 'reward_rate' },
    update: { value: '0.01' },
    create: { key: 'reward_rate', value: '0.01' },
  });

  await prisma.appUser.create({
    data: {
      clerkUserId: 'seed-clerk-user',
      email: 'user@betless.local',
      displayName: 'Betless User',
    },
  });

  await VaultService.createVault({
    walletAddress: Keypair.random().publicKey(),
    mode: VaultMode.PERIODIC_TOP_UP,
    targetAmount: 10000,
    currentAmount: 0,
    topUpAmount: 2000,
    topUpFrequency: TopUpFrequency.MONTHLY,
    durationMonths: 12,
    rewardType: 'Jollibee meal voucher',
    reason: 'Protect my savings and stay committed to my goal.',
  }, { clerkUserId: 'seed-clerk-user', vaultAccessTokenHash: null });

  const guestToken = createVaultAccessToken();
  await VaultService.createVault({
    walletAddress: Keypair.random().publicKey(),
    mode: VaultMode.ONE_TIME_LOCK,
    targetAmount: 5000,
    currentAmount: 5000,
    durationMonths: 6,
    rewardType: 'Transport voucher',
    reason: 'Keep this money safe for an important goal.',
  }, { clerkUserId: null, vaultAccessTokenHash: hashVaultAccessToken(guestToken) });

  console.log('Seed complete. Guest recovery token is intentionally not printed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
