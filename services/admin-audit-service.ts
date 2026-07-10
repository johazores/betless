import type { NextApiRequest } from 'next';
import { prisma } from '@/lib/prisma';

export type AuditInput = {
  adminUserId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  req?: NextApiRequest;
};

export class AdminAuditService {
  static async record(input: AuditInput) {
    return prisma.adminAuditLog.create({
      data: {
        adminUserId: input.adminUserId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        reason: input.reason ?? null,
        metadata: input.metadata ?? undefined,
        ipAddress: getRequestIp(input.req),
        userAgent: input.req?.headers['user-agent'] ?? null,
      },
    });
  }
}

export function getRequestIp(req?: NextApiRequest) {
  if (!req) return null;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() ?? null;
  return req.socket.remoteAddress ?? null;
}
