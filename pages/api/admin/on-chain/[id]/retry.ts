import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminAuditService } from '@/services/admin-audit-service';
import { StellarService } from '@/services/stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

  try {
    const admin = await AdminAuthService.requireAdmin(req, AdminPermission.RETRY_ON_CHAIN);
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { confirmation, reason } = req.body ?? {};
    if (!id) throw new Error('Operation id is required.');
    if (confirmation !== 'RETRY') throw new Error('Type RETRY to confirm this on-chain retry.');
    const operation = await StellarService.retryOperation(id);
    await AdminAuditService.record({
      adminUserId: admin.id,
      action: 'STELLAR_OPERATION_RETRIED',
      targetType: 'StellarOperation',
      targetId: id,
      reason: typeof reason === 'string' ? reason : null,
      metadata: { state: operation.state },
      req,
    });
    return sendSuccess(res, { id: operation.id, state: operation.state, errorMessage: operation.errorMessage });
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
