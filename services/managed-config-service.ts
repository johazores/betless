import { decryptConfigValue, encryptConfigValue, maskSecret } from '@/lib/admin-crypto';
import { prisma } from '@/lib/prisma';
import { AdminAuditService } from '@/services/admin-audit-service';
import type { NextApiRequest } from 'next';

export const managedConfigDefinitions = [
  { key: 'APP_ENV_LABEL', secret: false, bootCritical: false, description: 'Displayed environment label for admin operators.' },
  { key: 'STELLAR_NETWORK', secret: false, bootCritical: false, description: 'Stellar network: staging or live.' },
  { key: 'STELLAR_ASSET_CODE', secret: false, bootCritical: false, description: 'Settlement asset code.' },
  { key: 'STELLAR_ASSET_ISSUER', secret: false, bootCritical: false, description: 'Settlement asset issuer public key.' },
  { key: 'STELLAR_HORIZON_URL', secret: false, bootCritical: false, description: 'Optional Horizon URL override.' },
  { key: 'STELLAR_TREASURY_SECRET', secret: true, bootCritical: false, description: 'Treasury signer secret used by on-chain settlement.' },
  { key: 'STELLAR_OPS_SECRET', secret: true, bootCritical: false, description: 'Ops signer secret used by early-withdrawal settlement.' },
  { key: 'NEXT_PUBLIC_CLERK_SIGN_IN_URL', secret: false, bootCritical: false, description: 'User sign-in URL setting.' },
  { key: 'NEXT_PUBLIC_CLERK_SIGN_UP_URL', secret: false, bootCritical: false, description: 'User sign-up URL setting.' },
  { key: 'DATABASE_URL', secret: true, bootCritical: true, description: 'Database connection string. Read-only in admin.' },
  { key: 'ADMIN_JWT_SECRET', secret: true, bootCritical: true, description: 'JWT signing bootstrap secret. Read-only in admin.' },
  { key: 'ADMIN_CONFIG_ENCRYPTION_KEY', secret: true, bootCritical: true, description: 'Managed config encryption bootstrap key. Read-only in admin.' },
] as const;

const definitionByKey = new Map<string, (typeof managedConfigDefinitions)[number]>(
  managedConfigDefinitions.map((definition) => [definition.key, definition]),
);

export class ManagedConfigService {
  static async getValue(key: string) {
    const row = await prisma.managedConfig.findUnique({ where: { key } });
    if (!row) return process.env[key] ?? null;
    if (row.isSecret) return row.encryptedValue ? decryptConfigValue(row.encryptedValue) : null;
    return row.value ?? process.env[key] ?? null;
  }

  static async list() {
    const rows = await prisma.managedConfig.findMany({
      include: { updatedBy: { select: { email: true } } },
      orderBy: { key: 'asc' },
    });
    const byKey = new Map<string, any>(rows.map((row: any) => [row.key, row]));

    return managedConfigDefinitions.map((definition) => {
      const row = byKey.get(definition.key);
      const envValue = process.env[definition.key] ?? null;
      const actualValue = row
        ? row.isSecret
          ? row.encryptedValue
            ? decryptConfigValue(row.encryptedValue)
            : null
          : row.value
        : envValue;
      return {
        key: definition.key,
        description: definition.description,
        isSecret: definition.secret,
        bootCritical: definition.bootCritical,
        source: row ? 'managed' : envValue ? 'process' : 'unset',
        value: definition.secret ? maskSecret(actualValue) : actualValue,
        hasValue: Boolean(actualValue),
        updatedAt: row?.updatedAt?.toISOString() ?? null,
        updatedBy: row?.updatedBy?.email ?? null,
      };
    });
  }

  static async upsert(input: {
    key: string;
    value: string;
    adminUserId: string;
    req?: NextApiRequest;
  }) {
    const definition = definitionByKey.get(input.key);
    if (!definition) throw new Error('This config key is not managed by admin.');
    if (definition.bootCritical) throw new Error('Boot-critical config is read-only in admin.');

    const data = definition.secret
      ? { value: null, encryptedValue: encryptConfigValue(input.value), isSecret: true }
      : { value: input.value, encryptedValue: null, isSecret: false };

    const row = await prisma.managedConfig.upsert({
      where: { key: input.key },
      create: {
        key: input.key,
        description: definition.description,
        updatedById: input.adminUserId,
        ...data,
      },
      update: {
        description: definition.description,
        updatedById: input.adminUserId,
        ...data,
      },
    });

    await AdminAuditService.record({
      adminUserId: input.adminUserId,
      action: 'CONFIG_UPDATED',
      targetType: 'ManagedConfig',
      targetId: input.key,
      metadata: { key: input.key, isSecret: definition.secret },
      req: input.req,
    });

    return row;
  }

  static async reset(input: {
    key: string;
    adminUserId: string;
    req?: NextApiRequest;
  }) {
    const definition = definitionByKey.get(input.key);
    if (!definition) throw new Error('This config key is not managed by admin.');
    if (definition.bootCritical) throw new Error('Boot-critical config is read-only in admin.');

    await prisma.managedConfig.deleteMany({ where: { key: input.key } });

    await AdminAuditService.record({
      adminUserId: input.adminUserId,
      action: 'CONFIG_RESET',
      targetType: 'ManagedConfig',
      targetId: input.key,
      metadata: { key: input.key },
      req: input.req,
    });
  }
}
