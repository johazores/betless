import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

  try {
    const session = await AdminAuthService.refresh(req, res);
    return sendSuccess(res, session);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
