import crypto from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function getRequiredSecret(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} is required in production.`);
  }
  return fallback;
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const key = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
  return `scrypt:${salt}:${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, hash] = storedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  const key = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
  const expected = Buffer.from(hash, 'base64url');
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
}

export type AdminJwtPayload = {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
};

export function signAdminJwt(payload: Omit<AdminJwtPayload, 'iat'>) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body: AdminJwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedBody = base64Url(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', getRequiredSecret('ADMIN_JWT_SECRET', 'dev-admin-jwt-secret'))
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

export function verifyAdminJwt(token: string): AdminJwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid admin token.');

  const [encodedHeader, encodedBody, signature] = parts;
  const expected = crypto
    .createHmac('sha256', getRequiredSecret('ADMIN_JWT_SECRET', 'dev-admin-jwt-secret'))
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error('Invalid admin token.');
  }

  const payload = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8')) as AdminJwtPayload;
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('Admin token expired.');
  }
  return payload;
}

function getEncryptionKey() {
  const secret = getRequiredSecret('ADMIN_CONFIG_ENCRYPTION_KEY', 'dev-admin-config-encryption-key');
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptConfigValue(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptConfigValue(payload: string) {
  const [ivRaw, authTagRaw, encryptedRaw] = payload.split('.');
  if (!ivRaw || !authTagRaw || !encryptedRaw) throw new Error('Invalid encrypted config value.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(authTagRaw, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function maskSecret(value: string | null | undefined) {
  if (!value) return null;
  if (value.length <= 8) return '••••';
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}
