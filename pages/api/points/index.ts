import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { PointsService } from '@/services/points-service';

/** Full points history: monthly rewards earned and redemptions. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const clerkUserId = requireApiUserId(req);
    const skipSync = req.query.skipSync === '1';
    const transactions = await PointsService.listTransactions(clerkUserId, { sync: !skipSync });
    return sendSuccess(res, transactions);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
