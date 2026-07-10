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
    if (req.method !== 'POST') return sendError(res, 'Method not allowed.', 405);

    const actor = await AdminAuthService.requireAdmin(req, AdminPermission.MANAGE_ADMINS);
    const { password } = req.body ?? {};
    if (typeof password !== 'string') throw new Error('Password is required.');

    const admin = await AdminAuthService.resetAdminPassword({
      actorId: actor.id,
      adminId: id,
      password,
      req,
    });
    return sendSuccess(res, serializeAdmin(admin));
  } catch (error) {
    return sendError(res, getApiErrorMessage(error), 400);
  }
}
