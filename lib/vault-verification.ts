import { getSiteUrl } from '@/lib/site';

export function buildVaultVerificationUrl(token: string, origin = getSiteUrl()) {
  return `${origin.replace(/\/$/, '')}/verify/${token}`;
}
