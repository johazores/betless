import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { validateClaimReferralRequest } from '@/lib/validators';
import { ReferralService } from '@/services/referral-service';

/** Claim a friend's referral code; both accounts receive the points bonus. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const clerkUserId = requireApiUserId(req);
    const code = validateClaimReferralRequest(req.body);
    const result = await ReferralService.claimCode(clerkUserId, code);
    return sendSuccess(res, result);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
