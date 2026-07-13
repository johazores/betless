import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { VaultService } from '@/services/vault-service';

function requireCronSecret(req: NextApiRequest) {
  const configured = process.env.CRON_SECRET?.trim();
  if (!configured) {
    throw new Error('Cron is not configured.');
  }

  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim()
    ?? (typeof req.query.secret === 'string' ? req.query.secret : undefined);

  if (!provided || provided !== configured) {
    throw new Error('Unauthorized cron request.');
  }
}

/**
 * Sweeps all active vaults: accrues due points and settles matured vaults.
 * Protect with CRON_SECRET — wire to Vercel Cron, GitHub Actions, or any scheduler.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendError(res, 'Method not allowed.', 405);
  }

  try {
    requireCronSecret(req);
    const result = await VaultService.syncAllVaults();
    return sendSuccess(res, result);
  } catch (error) {
    const message = getApiErrorMessage(error);
    const status = message.includes('Unauthorized') ? 401 : message.includes('not configured') ? 503 : 500;
    return sendError(res, message, status);
  }
}
