import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { AdminAuthService } from '@/services/admin-auth-service';
import { AdminAuditService } from '@/services/admin-audit-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_CONFIG);
      const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
      return sendSuccess(res, flags.map((flag: any) => ({ ...flag, createdAt: flag.createdAt.toISOString(), updatedAt: flag.updatedAt.toISOString() })));
    }

    if (req.method === 'POST') {
      const admin = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_CONFIG);
      const { key, enabled, description } = req.body ?? {};
      if (typeof key !== 'string' || typeof enabled !== 'boolean') throw new Error('Flag key and enabled state are required.');
      const flag = await prisma.featureFlag.upsert({
        where: { key },
        create: { key, enabled, description: typeof description === 'string' ? description : null, updatedById: admin.id },
        update: { enabled, description: typeof description === 'string' ? description : undefined, updatedById: admin.id },
      });
      await AdminAuditService.record({
        adminUserId: admin.id,
        action: 'FEATURE_FLAG_UPDATED',
        targetType: 'FeatureFlag',
        targetId: key,
        metadata: { enabled },
        req,
      });
      return sendSuccess(res, flag);
    }

    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
