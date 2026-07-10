import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { OnChainOverviewService } from '@/services/on-chain-overview-service';
import { UserService } from '@/services/user-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const clerkUserId = requireApiUserId(req);
    const appUser = await UserService.ensureAppUser(clerkUserId);
    return sendSuccess(res, await OnChainOverviewService.getForUser(appUser.id));
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
