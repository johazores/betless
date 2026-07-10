import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiVaultAccess } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AnalyticsService } from '@/services/analytics-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const access = await getApiVaultAccess(req);
    const analytics = await AnalyticsService.getAnalytics(access);
    return sendSuccess(res, analytics);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message.includes('sign in') || message.includes('saved vault link') ? 401 : 400);
  }
}
