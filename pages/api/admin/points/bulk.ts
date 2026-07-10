import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

  try {
    const admin = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_POINTS);
    const { emails, points, reason } = req.body ?? {};
    const parsedEmails = Array.isArray(emails)
      ? emails.filter((email) => typeof email === 'string')
      : typeof emails === 'string'
        ? emails.split(/[\n,]/)
        : [];
    return sendSuccess(res, await AdminPlatformService.bulkAdjustPoints({
      adminUserId: admin.id,
      emails: parsedEmails,
      points: Number(points),
      reason: typeof reason === 'string' ? reason : '',
      req,
    }));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
