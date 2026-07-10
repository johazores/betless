import type { NextApiRequest, NextApiResponse } from 'next';
import { requireMethod } from '@/lib/api-methods';
import { sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { ConfigService } from '@/services/config-service';
import { StellarService } from '@/services/stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  const networkLabel = ConfigService.getStellarNetworkLabel();

  const [database, stellarReachable] = await Promise.all([
    prisma
      .$queryRaw`SELECT 1`
      .then(() => 'connected' as const)
      .catch(() => 'unavailable' as const),
    // A real Horizon reachability check for the configured network.
    StellarService.ping(),
  ]);

  const stellar = stellarReachable ? 'reachable' : 'unreachable';
  const status = database === 'connected' && stellarReachable ? 'ok' : 'degraded';

  return sendSuccess(res, {
    status,
    database,
    stellarNetwork: networkLabel,
    stellarHorizon: stellar,
    horizonUrl: ConfigService.getStellarHorizonUrl(),
    timestamp: new Date().toISOString(),
  });
}
