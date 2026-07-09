import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateCreateVaultRequest } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed.', 405);
  }

  try {
    const input = validateCreateVaultRequest(req.body);
    const vault = await VaultService.createVault(input);
    return sendSuccess(res, vault, 201);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
