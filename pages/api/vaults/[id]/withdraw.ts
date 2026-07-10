import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { getSingleQueryValue } from '@/lib/validators';
import { VaultService } from '@/services/vault-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  const id = getSingleQueryValue(req.query.id);

  if (!id) {
    return sendError(res, 'Vault ID is required.', 400);
  }

  try {
    const clerkUserId = requireApiUserId(req);
    const result = await VaultService.withdrawEarly(id, clerkUserId);
    return sendSuccess(res, result);
  } catch (error) {
    const message = getApiErrorMessage(error);
    const status = message === 'Vault not found.' ? 404 : message.includes('sign in') ? 401 : 400;
    return sendError(res, message, status);
  }
}
