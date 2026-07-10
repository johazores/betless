import { Keypair } from '@stellar/stellar-sdk';
import { TopUpFrequency, VaultMode } from '../lib/domain';
import { prisma } from '../lib/prisma';
import { VaultService } from '../services/vault-service';

async function main() {
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
      clerkUserId: 'demo-clerk-user',
      email: 'demo@betless.local',
      displayName: 'Demo User',
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
    reason: 'I want to protect my savings and stay committed to my goal.',
  }, 'demo-clerk-user');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
