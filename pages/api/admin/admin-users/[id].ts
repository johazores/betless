import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminPermission } from '@/lib/admin-permissions';
import { getApiErrorMessage, sendError, sendSuccess } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { AdminAuthService } from '@/services/admin-auth-service';

function serializeAdmin(admin: {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: admin.id,
    email: admin.email,
    displayName: admin.displayName,
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    createdAt: admin.createdAt.toISOString(),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) return sendError(res, 'Admin id is required.', 400);

  try {
    if (req.method === 'PATCH') {
      const actor = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_ADMINS);
      const { displayName, role, isActive } = req.body ?? {};
      const admin = await AdminAuthService.updateAdmin({
        actorId: actor.id,
        adminId: id,
        displayName: displayName !== undefined ? String(displayName) : undefined,
        role: typeof role === 'string' ? role : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        req,
      });
      return sendSuccess(res, serializeAdmin(admin));
    }

    if (req.method === 'DELETE') {
      const actor = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_ADMINS);
      const admin = await AdminAuthService.updateAdmin({
        actorId: actor.id,
        adminId: id,
        isActive: false,
        req,
      });
      return sendSuccess(res, serializeAdmin(admin));
    }

    return sendError(res, 'Method not allowed.', 405);
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
