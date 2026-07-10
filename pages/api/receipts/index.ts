import type { NextApiRequest, NextApiResponse } from 'next';
import { requireApiUserId } from '@/lib/auth';
import { requireMethod } from '@/lib/api-methods';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { ReceiptService } from '@/services/receipt-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const clerkUserId = await requireApiUserId(req);
    const receipts = await ReceiptService.listReceipts(clerkUserId);
    return sendSuccess(res, receipts);
  } catch (error) {
    const message = getApiErrorMessage(error);
    return sendError(res, message, message === 'Please sign in to continue.' ? 401 : 400);
  }
}
