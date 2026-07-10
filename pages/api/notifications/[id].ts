import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { NotificationService } from '@/services/notification-service';
import { UserService } from '@/services/user-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return sendError(res, 'Notification id is required.', 400);

  try {
    const clerkUserId = requireApiUserId(req);
    const appUser = await UserService.ensureAppUser(clerkUserId);

    if (req.method === 'PATCH') {
      const body = req.body as { read?: boolean };
      await NotificationService.markRead(appUser.id, id, body.read !== false);
      const data = await NotificationService.listForUser(appUser.id);
      return sendSuccess(res, data);
    }

    res.setHeader('Allow', 'PATCH');
    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
