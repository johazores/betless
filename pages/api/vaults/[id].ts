import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { getSingleQueryValue } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed.', 405);
  }

  const id = getSingleQueryValue(req.query.id);

  if (!id) {
    return sendError(res, 'Vault ID is required.', 400);
  }

  try {
    const vault = await VaultService.getVaultDetail(id);
    return sendSuccess(res, vault);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message === 'Vault not found.' ? 404 : 400);
  }
}
