import type { NextApiRequest, NextApiResponse } from 'next';
import { requireMethod } from '@/lib/api-methods';
import { sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    await prisma.$queryRaw`SELECT 1`;

    return sendSuccess(res, {
      status: 'ok',
      database: 'connected',
      stellarNetwork: 'testnet',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return sendSuccess(res, {
      status: 'degraded',
      database: 'unavailable',
      stellarNetwork: 'testnet',
      timestamp: new Date().toISOString(),
    });
  }
}
