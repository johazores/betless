import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return sendError(res, 'User id is required.', 400);

  try {
    if (req.method === 'GET') {
      await AdminAuthService.requireAdmin(req, AdminPermission.VIEW_USERS);
      return sendSuccess(res, await AdminPlatformService.getUserDetail(id));
    }

    if (req.method === 'PATCH') {
      const admin = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_USERS);
      const { status, verificationStatus } = req.body ?? {};
      const updated = await AdminPlatformService.updateAppUser({
        adminUserId: admin.id,
        appUserId: id,
        status: typeof status === 'string' ? status : undefined,
        verificationStatus: typeof verificationStatus === 'string' ? verificationStatus : undefined,
        req,
      });
      return sendSuccess(res, await AdminPlatformService.getUserDetail(updated.id));
    }

    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
