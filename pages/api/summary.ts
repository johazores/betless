import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { PointsService } from '@/services/points-service';
import { UserService } from '@/services/user-service';
import { VaultService } from '@/services/vault-service';
import type { SummaryView } from '@/types/vault';

/** Locked balance + available points, shown in the top navigation. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const clerkUserId = requireApiUserId(req);
    const appUser = await UserService.ensureAppUser(clerkUserId);
    await VaultService.syncVaults(appUser.id);

    const [lockedBalance, availablePoints] = await Promise.all([
      VaultService.getLockedBalance(appUser.id),
      PointsService.getBalance(appUser.id),
    ]);

    return sendSuccess(res, { lockedBalance, availablePoints } satisfies SummaryView);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
