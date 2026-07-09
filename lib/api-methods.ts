import type { NextApiRequest, NextApiResponse } from 'next';
import { sendError } from '@/lib/api-response';

export function requireMethod(req: NextApiRequest, res: NextApiResponse, method: 'GET' | 'POST') {
  if (req.method === method) {
    return true;
  }

  res.setHeader('Allow', method);
  sendError(res, 'Method not allowed.', 405);
  return false;
}
