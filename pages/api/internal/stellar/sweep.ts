import { timingSafeEqual } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { StellarSweepService } from '@/services/stellar-sweep-service';

function authorized(req: NextApiRequest): boolean {
  const configured = process.env.CRON_SECRET?.trim();
  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
  if (!configured || !provided) return false;

  const expected = Buffer.from(configured);
  const received = Buffer.from(provided);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 'Method not allowed.', 405);
  }

  if (!process.env.CRON_SECRET?.trim()) {
    return sendError(res, 'The Stellar sweep endpoint is not configured.', 503);
  }
  if (!authorized(req)) {
    return sendError(res, 'Unauthorized.', 401);
  }

  try {
    const result = await StellarSweepService.run();
    return sendSuccess(res, result);
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    const status = errorMessage.includes('already running') ? 409 : errorMessage.includes('not configured') ? 503 : 500;
    return sendError(res, errorMessage, status);
  }
}
