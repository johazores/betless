import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateCreateVaultRequest } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clerkUserId = requireApiUserId(req);

    if (req.method === 'GET') {
      const vaults = await VaultService.listVaults(clerkUserId);
      return sendSuccess(res, vaults);
    }

    if (req.method === 'POST') {
      const input = validateCreateVaultRequest(req.body);
      const vault = await VaultService.createVault(input, clerkUserId);
      return sendSuccess(res, vault, 201);
    }

    res.setHeader('Allow', 'GET, POST');
    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
