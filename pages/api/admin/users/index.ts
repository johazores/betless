import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return sendError(res, 'Method not allowed.', 405);

  try {
    await AdminAuthService.requireAdmin(req, AdminPermission.VIEW_USERS);
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const status = typeof req.query.status === 'string' && req.query.status !== 'ALL' ? req.query.status : undefined;
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    return sendSuccess(res, await AdminPlatformService.listUsers({ q, status, page }));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
