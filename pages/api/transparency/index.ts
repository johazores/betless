import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { TransparencyService } from '@/services/transparency-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, 'Method not allowed.', 405);
  }

  try {
    const overview = await TransparencyService.getOverview();
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return sendSuccess(res, overview);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 500);
  }
}
