import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { getSingleQueryValue } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  const id = getSingleQueryValue(req.query.id);

  if (!id) {
    return sendError(res, 'Vault ID is required.', 400);
  }

  try {
    const clerkUserId = await requireApiUserId(req);
    const vault = await VaultService.getVaultDetail(id, clerkUserId);
    return sendSuccess(res, vault);
  } catch (error) {
    const message = getApiErrorMessage(error);
    if (message === 'Please sign in to continue.') return sendError(res, message, 401);
    return sendError(res, message, message === 'Vault not found.' ? 404 : 400);
  }
}
