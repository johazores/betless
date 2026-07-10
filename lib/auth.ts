import crypto from 'node:crypto';
import type { NextApiRequest } from 'next';
import { verifyToken } from '@clerk/backend';

export type ApiVaultAccess = {
  clerkUserId?: string | null;
  vaultAccessTokenHash?: string | null;
};

function getBearerToken(req: NextApiRequest) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function createVaultAccessToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashVaultAccessToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getVaultAccessToken(req: NextApiRequest) {
  const token = getHeaderValue(req.headers['x-vault-token']);
  return typeof token === 'string' && token.trim().length > 0 ? token.trim() : null;
}

export async function getOptionalApiUserId(req: NextApiRequest) {
  const token = getBearerToken(req);

  if (!token) return null;

  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Account verification is not configured. Add CLERK_SECRET_KEY to enable saved accounts.');
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    return payload.sub ?? null;
  } catch {
    throw new Error('Please sign in again. Your session could not be verified.');
  }
}

export async function requireApiUserId(req: NextApiRequest) {
  const clerkUserId = await getOptionalApiUserId(req);

  if (!clerkUserId) {
    throw new Error('Please sign in to continue.');
  }

  return clerkUserId;
}

export async function getApiVaultAccess(req: NextApiRequest): Promise<ApiVaultAccess> {
  const clerkUserId = await getOptionalApiUserId(req);
  const vaultAccessToken = getVaultAccessToken(req);

  return {
    clerkUserId,
    vaultAccessTokenHash: vaultAccessToken ? hashVaultAccessToken(vaultAccessToken) : null,
  };
}
