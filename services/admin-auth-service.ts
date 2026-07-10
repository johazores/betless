import type { NextApiRequest, NextApiResponse } from 'next';
import { AdminRole } from '@/lib/domain';
import { AdminPermission, getAdminPermissions, hasAdminPermission } from '@/lib/admin-permissions';
import {
  generateToken,
  hashPassword,
  hashToken,
  signAdminJwt,
  verifyAdminJwt,
  verifyPassword,
} from '@/lib/admin-crypto';
import { prisma } from '@/lib/prisma';
import { AdminAuditService, getRequestIp } from '@/services/admin-audit-service';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_DAYS = 14;
const REFRESH_COOKIE = 'betless_admin_refresh';

export type AdminContext = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
};

function refreshExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TOKEN_TTL_DAYS);
  return date;
}

function accessExpirySeconds() {
  return Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS;
}

function setRefreshCookie(res: NextApiResponse, token: string, expires: Date) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${REFRESH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${secure}; Expires=${expires.toUTCString()}`,
  );
}

function clearRefreshCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${REFRESH_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

function getBearerToken(req: NextApiRequest) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

async function maybeBootstrapAdmin(email: string, password: string) {
  const count = await prisma.adminUser.count();
  if (count > 0) return null;

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (!bootstrapEmail || !bootstrapPassword || email.toLowerCase() !== bootstrapEmail || password !== bootstrapPassword) {
    return null;
  }

  return prisma.adminUser.create({
    data: {
      email: bootstrapEmail,
      displayName: 'Bootstrap Super Admin',
      passwordHash: await hashPassword(password),
      role: AdminRole.SUPER_ADMIN,
    },
  });
}

function toSessionPayload(admin: { id: string; email: string; role: string }) {
  const permissions = getAdminPermissions(admin.role);
  return {
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions,
    },
    accessToken: signAdminJwt({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      permissions,
      exp: accessExpirySeconds(),
    }),
  };
}

export class AdminAuthService {
  static async login(req: NextApiRequest, res: NextApiResponse, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    let admin = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (!admin) {
      admin = await maybeBootstrapAdmin(normalizedEmail, password);
    }

    if (!admin || !admin.isActive || !(await verifyPassword(password, admin.passwordHash))) {
      await AdminAuditService.record({
        action: 'ADMIN_LOGIN_FAILED',
        targetType: 'AdminUser',
        targetId: normalizedEmail,
        req,
      });
      throw new Error('Invalid admin credentials.');
    }

    const refreshToken = generateToken(48);
    const expiresAt = refreshExpiry();
    await prisma.adminRefreshToken.create({
      data: {
        adminUserId: admin.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
        ipAddress: getRequestIp(req),
        userAgent: req.headers['user-agent'] ?? null,
      },
    });
    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await AdminAuditService.record({
      adminUserId: admin.id,
      action: 'ADMIN_LOGIN',
      targetType: 'AdminUser',
      targetId: admin.id,
      req,
    });

    setRefreshCookie(res, refreshToken, expiresAt);
    return toSessionPayload(admin);
  }

  static async refresh(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) throw new Error('Admin refresh token missing.');

    const tokenHash = hashToken(token);
    const existing = await prisma.adminRefreshToken.findUnique({
      where: { tokenHash },
      include: { adminUser: true },
    });

    if (!existing || existing.revokedAt || existing.expiresAt <= new Date() || !existing.adminUser.isActive) {
      throw new Error('Admin refresh token invalid.');
    }

    const newToken = generateToken(48);
    const newTokenHash = hashToken(newToken);
    const expiresAt = refreshExpiry();

    await prisma.$transaction(async (tx: any) => {
      await tx.adminRefreshToken.update({
        where: { id: existing.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenHash: newTokenHash,
          lastUsedAt: new Date(),
        },
      });
      await tx.adminRefreshToken.create({
        data: {
          adminUserId: existing.adminUserId,
          tokenHash: newTokenHash,
          expiresAt,
          ipAddress: getRequestIp(req),
          userAgent: req.headers['user-agent'] ?? null,
        },
      });
    });

    setRefreshCookie(res, newToken, expiresAt);
    return toSessionPayload(existing.adminUser);
  }

  static async logout(req: NextApiRequest, res: NextApiResponse, adminUserId?: string | null) {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      await prisma.adminRefreshToken.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date(), lastUsedAt: new Date() },
      });
    }
    await AdminAuditService.record({
      adminUserId,
      action: 'ADMIN_LOGOUT',
      targetType: 'AdminUser',
      targetId: adminUserId ?? null,
      req,
    });
    clearRefreshCookie(res);
  }

  static async requireAdmin(req: NextApiRequest, permission?: AdminPermission): Promise<AdminContext> {
    const token = getBearerToken(req);
    if (!token) throw new Error('Admin access token missing.');

    const payload = verifyAdminJwt(token);
    const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
    if (!admin || !admin.isActive) throw new Error('Admin access denied.');
    if (permission && !hasAdminPermission(admin.role, permission)) {
      throw new Error('Admin permission denied.');
    }

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: getAdminPermissions(admin.role),
    };
  }
}
