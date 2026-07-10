import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminAuditService } from '@/services/admin-audit-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = Array.isArray(req.query.key) ? req.query.key[0] : req.query.key;
  if (!key) return sendError(res, 'Flag key is required.', 400);

  try {
    if (req.method !== 'DELETE') return sendError(res, 'Method not allowed.', 405);

    const admin = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_CONFIG);
    const existing = await prisma.featureFlag.findUnique({ where: { key } });
    if (!existing) throw new Error('Feature flag not found.');

    await prisma.featureFlag.delete({ where: { key } });
    await AdminAuditService.record({
      adminUserId: admin.id,
      action: 'FEATURE_FLAG_DELETED',
      targetType: 'FeatureFlag',
      targetId: key,
      req,
    });

    return sendSuccess(res, { deleted: key });
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
