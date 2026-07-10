import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Email and password are required.');
    }
    const session = await AdminAuthService.login(req, res, email, password);
    return sendSuccess(res, session);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
