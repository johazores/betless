import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return sendError(res, 'Method not allowed.', 405);

  try {
    const admin = await AdminAuthService.requireAdmin(req);
    return sendSuccess(res, { admin });
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
