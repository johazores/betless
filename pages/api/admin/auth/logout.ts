import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

  try {
    let adminUserId: string | null = null;
    try {
      adminUserId = (await AdminAuthService.requireAdmin(req)).id;
    } catch {
      adminUserId = null;
    }
    await AdminAuthService.logout(req, res, adminUserId);
    return sendSuccess(res, { ok: true });
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
