import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { NotificationService } from '@/services/notification-service';
import { UserService } from '@/services/user-service';
import type { NotificationCategory } from '@/types/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clerkUserId = requireApiUserId(req);
    const appUser = await UserService.ensureAppUser(clerkUserId);

    if (req.method === 'GET') {
      const category = typeof req.query.category === 'string' ? req.query.category as NotificationCategory : undefined;
      const data = await NotificationService.listForUser(appUser.id, { category });
      return sendSuccess(res, data);
    }

    if (req.method === 'POST') {
      const body = req.body as { action?: string };
      if (body.action === 'read_all') {
        await NotificationService.markAllRead(appUser.id);
        const data = await NotificationService.listForUser(appUser.id);
        return sendSuccess(res, data);
      }
      return sendError(res, 'Unknown action.', 400);
    }

    res.setHeader('Allow', 'GET, POST');
    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') ? 401 : 400);
  }
}
