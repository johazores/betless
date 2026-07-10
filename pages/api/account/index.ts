import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { UserService } from '@/services/user-service';
import type { AccountProfileView } from '@/types/account';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clerkUserId = requireApiUserId(req);

    if (req.method === 'GET') {
      const profile = await UserService.getAccountProfile(clerkUserId);
      return sendSuccess(res, profile satisfies AccountProfileView);
    }

    if (req.method === 'PATCH') {
      const body = req.body as { displayName?: string };
      if (!body.displayName?.trim()) {
        return sendError(res, 'Display name is required.', 400);
      }
      await UserService.updateDisplayName(clerkUserId, body.displayName);
      const profile = await UserService.getAccountProfile(clerkUserId);
      return sendSuccess(res, profile satisfies AccountProfileView);
    }

    res.setHeader('Allow', 'GET, PATCH');
    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
