import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminPlatformService } from '@/services/admin-platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return sendError(res, 'Method not allowed.', 405);

  try {
    await AdminAuthService.requireAdmin(req, AdminPermission.VIEW_AUDIT_LOGS);
    return sendSuccess(res, await AdminPlatformService.listAuditLogs());
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
