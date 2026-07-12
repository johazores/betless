import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { ReservesService } from '@/services/reserves-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, 'Method not allowed.', 405);
  }

  try {
    const overview = await ReservesService.getPublicOverview();
    return sendSuccess(res, overview);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
