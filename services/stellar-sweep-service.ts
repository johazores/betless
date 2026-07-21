import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { StellarService } from '@/services/stellar-service';

const LEASE_KEY = 'stellar.sweep.lease';
const LEASE_MS = 2 * 60 * 1000;
const MAX_OPERATIONS = 500;

type SweepState = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

type SweepResult = {
  startedAt: string;
  finishedAt: string;
  attempted: number;
  confirmed: number;
  pending: number;
  submitted: number;
  failed: number;
  errors: Array<{ operationId: string; message: string }>;
};

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown sweep error.';
}

async function acquireLease(owner: string): Promise<string | null> {
  await prisma.managedConfig.upsert({
    where: { key: LEASE_KEY },
    update: {},
    create: {
      key: LEASE_KEY,
      value: null,
      isSecret: false,
      description: 'Short database lease that prevents overlapping Stellar outbox sweeps.',
    },
  });

  const now = new Date();
  const leaseUntil = new Date(now.getTime() + LEASE_MS).toISOString();
  const leaseValue = `${leaseUntil}|${owner}`;
  const acquired = await prisma.managedConfig.updateMany({
    where: {
      key: LEASE_KEY,
      OR: [{ value: null }, { value: { lt: now.toISOString() } }],
    },
    data: { value: leaseValue },
  });

  return acquired.count === 1 ? leaseValue : null;
}

async function releaseLease(leaseValue: string): Promise<void> {
  await prisma.managedConfig.updateMany({
    where: { key: LEASE_KEY, value: leaseValue },
    data: { value: null },
  });
}

export class StellarSweepService {
  static async run(): Promise<SweepResult> {
    if (!StellarService.isEnabled()) {
      throw new Error('Stellar is not configured.');
    }

    const startedAt = new Date();
    const owner = randomUUID();
    const leaseValue = await acquireLease(owner);
    if (!leaseValue) {
      throw new Error('Another Stellar outbox sweep is already running.');
    }

    const errors: SweepResult['errors'] = [];
    const finalStates: SweepState[] = [];

    try {
      const operations = await prisma.stellarOperation.findMany({
        where: { state: { in: ['PENDING', 'SUBMITTED'] } },
        orderBy: { createdAt: 'asc' },
        take: MAX_OPERATIONS,
        select: { id: true },
      });

      for (const operation of operations) {
        try {
          const updated = await StellarService.retryOperation(operation.id);
          finalStates.push(updated.state as SweepState);
        } catch (error) {
          errors.push({ operationId: operation.id, message: message(error).slice(0, 300) });
          const current = await prisma.stellarOperation.findUnique({
            where: { id: operation.id },
            select: { state: true },
          });
          if (current) finalStates.push(current.state as SweepState);
        }
      }

      return {
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        attempted: operations.length,
        confirmed: finalStates.filter((state) => state === 'CONFIRMED').length,
        pending: finalStates.filter((state) => state === 'PENDING').length,
        submitted: finalStates.filter((state) => state === 'SUBMITTED').length,
        failed: finalStates.filter((state) => state === 'FAILED').length,
        errors,
      };
    } finally {
      await releaseLease(leaseValue);
    }
  }
}
