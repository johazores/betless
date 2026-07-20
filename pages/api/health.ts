import type { NextApiRequest, NextApiResponse } from 'next';
import { requireMethod } from '@/lib/api-methods';
import { sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { getStellarNetwork, isStellarEnabled } from '@/lib/stellar-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  const database = await prisma
    .$queryRaw`SELECT 1`
    .then(() => 'connected' as const)
    .catch(() => 'unavailable' as const);

  return sendSuccess(res, {
    status: database === 'connected' ? 'ok' : 'degraded',
    database,
    stellar: {
      network: getStellarNetwork().toLowerCase(),
      settlement: isStellarEnabled() ? 'configured' : 'disabled',
    },
    timestamp: new Date().toISOString(),
  });
}
