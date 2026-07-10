import { prisma } from '../lib/prisma';

/**
 * Clears all data for a fresh development database. Real vaults are created
 * through the app by signed-in users, so no fixture data is seeded.
 */
async function main() {
  await prisma.pointsTransaction.deleteMany();
  await prisma.vault.deleteMany();
  await prisma.appUser.deleteMany();

  console.log('Seed complete: database cleared.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
