import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return sendError(res, 'Method not allowed.', 405);

  try {
    await AdminAuthService.requireAdmin(req, AdminPermission.VIEW_USERS);
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) throw new Error('User id is required.');
    return sendSuccess(res, await AdminPlatformService.getUserDetail(id));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
