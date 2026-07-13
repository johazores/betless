import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { getSingleQueryValue } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, 'Method not allowed.', 405);
  }

  try {
    const id = getSingleQueryValue(req.query.id);
    if (!id) {
      return sendError(res, 'Vault id is required.', 400);
    }

    const certificate = await VaultService.getCommitmentCertificate(id);
    if (!certificate) {
      return sendError(res, 'Vault not found.', 404);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return sendSuccess(res, certificate);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 500);
  }
}
