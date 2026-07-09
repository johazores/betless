import type { NextApiRequest, NextApiResponse } from 'next';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateCreateVaultRequest } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const input = validateCreateVaultRequest(req.body);
    const vault = await VaultService.createVault(input);
    return sendSuccess(res, vault, 201);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
