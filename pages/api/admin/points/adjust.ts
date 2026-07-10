import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

  try {
    const admin = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_POINTS);
    const { appUserId, points, reason } = req.body ?? {};
    if (typeof appUserId !== 'string' || typeof reason !== 'string') throw new Error('User and reason are required.');
    const numericPoints = Number(points);
    return sendSuccess(res, await AdminPlatformService.adjustPoints({
      adminUserId: admin.id,
      appUserId,
      points: numericPoints,
      reason,
      req,
    }));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
