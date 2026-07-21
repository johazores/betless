import { prisma } from '../lib/prisma';
import { StellarSweepService } from '../services/stellar-sweep-service';

async function main() {
  const result = await StellarSweepService.run();
  console.log(JSON.stringify(result, null, 2));

  if (result.failed > 0 || result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('Stellar outbox sweep failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
