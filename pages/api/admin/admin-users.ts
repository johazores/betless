import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { AdminAuthService } from '@/services/admin-auth-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return sendError(res, 'Method not allowed.', 405);

  try {
    await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_ADMINS);
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    return sendSuccess(res, admins.map((admin: any) => ({
      ...admin,
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
      createdAt: admin.createdAt.toISOString(),
    })));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 401);
  }
}
