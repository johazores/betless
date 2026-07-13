import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { TransparencyService } from '@/services/transparency-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, 'Method not allowed.', 405);
  }

  try {
    await AdminAuthService.requireAdmin(req, AdminPermission.VIEW_ON_CHAIN);
    const overview = await TransparencyService.getOverview();
    return sendSuccess(res, overview);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
