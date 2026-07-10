import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { ManagedConfigService } from '@/services/managed-config-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_CONFIG);
      return sendSuccess(res, await ManagedConfigService.list());
    }

    if (req.method === 'POST') {
      const admin = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_CONFIG);
      const { key, value } = req.body ?? {};
      if (typeof key !== 'string' || typeof value !== 'string') throw new Error('Config key and value are required.');
      await ManagedConfigService.upsert({ key, value, adminUserId: admin.id, req });
      return sendSuccess(res, await ManagedConfigService.list());
    }

    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
