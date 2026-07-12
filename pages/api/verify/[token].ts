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
    const token = getSingleQueryValue(req.query.token)?.trim();

    if (!token) {
      return sendError(res, 'Verification token is required.', 400);
    }

    const verification = await VaultService.getPublicVerification(token);

    if (!verification) {
      return sendError(res, 'Vault not found.', 404);
    }

    return sendSuccess(res, verification);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
