import type { NextApiRequest, NextApiResponse } from 'next';
import { PointsTransactionType } from '@/lib/domain';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return sendError(res, 'Method not allowed.', 405);

  try {
    await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_POINTS);
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const type = typeof req.query.type === 'string' ? req.query.type : PointsTransactionType.ADMIN_ADJUSTMENT;
    return sendSuccess(res, await AdminPlatformService.listPointsHistory({ q, page, type }));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
