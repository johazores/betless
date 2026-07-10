import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateRedeemRequest } from '@/lib/validators';
import { PointsService } from '@/services/points-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const clerkUserId = requireApiUserId(req);
    const rewardId = validateRedeemRequest(req.body);
    const result = await PointsService.redeemReward(clerkUserId, rewardId);
    return sendSuccess(res, result);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
