import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { ReferralService } from '@/services/referral-service';

/** The signed-in user's referral code, referral count, and claim status. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const clerkUserId = requireApiUserId(req);
    const info = await ReferralService.getReferralInfo(clerkUserId);
    return sendSuccess(res, info);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
