import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiVaultAccess, requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const clerkUserId = await requireApiUserId(req);
    const access = await getApiVaultAccess(req);
    const result = await VaultService.connectGuestSessionToUser(clerkUserId, access.vaultAccessTokenHash);
    return sendSuccess(res, result);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
