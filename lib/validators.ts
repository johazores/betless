import { TopUpFrequency, VaultMode } from '@prisma/client';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { toNumber } from '@/lib/money';

export type CreateVaultInput = {
  walletAddress: string;
  mode: VaultMode;
  targetAmount: number;
  currentAmount: number;
  topUpAmount?: number;
  topUpFrequency?: TopUpFrequency;
  durationMonths: number;
  rewardType: string;
  reason?: string;
};

export function getSingleQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

export function validateCreateVaultRequest(body: unknown): CreateVaultInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required.');
  }

  const payload = body as Record<string, unknown>;
  const walletAddress = requireString(payload.walletAddress, 'Stellar public address');

  if (!isValidStellarPublicKey(walletAddress)) {
    throw new Error('Please enter a valid Stellar public address.');
  }

  const mode = payload.mode === VaultMode.ONE_TIME_LOCK ? VaultMode.ONE_TIME_LOCK : VaultMode.PERIODIC_TOP_UP;
  const targetAmount = toNumber(payload.targetAmount);
  const currentAmount = toNumber(payload.currentAmount);
  const durationMonths = toNumber(payload.durationMonths);
  const topUpAmount = payload.topUpAmount === undefined ? undefined : toNumber(payload.topUpAmount);
  const topUpFrequency = payload.topUpFrequency === TopUpFrequency.WEEKLY ? TopUpFrequency.WEEKLY : TopUpFrequency.MONTHLY;
  const rewardType = requireString(payload.rewardType, 'Reward preference');
  const reason = typeof payload.reason === 'string' ? payload.reason.trim() : undefined;

  if (targetAmount <= 0) throw new Error('Target amount must be greater than zero.');
  if (currentAmount < 0) throw new Error('Starting amount cannot be negative.');
  if (currentAmount > targetAmount) throw new Error('Starting amount cannot be higher than target amount.');
  if (durationMonths < 1 || durationMonths > 36) throw new Error('Duration must be between 1 and 36 months.');

  if (mode === VaultMode.PERIODIC_TOP_UP && (!topUpAmount || topUpAmount <= 0)) {
    throw new Error('Top-up amount is required for periodic top-up vaults.');
  }

  return {
    walletAddress,
    mode,
    targetAmount,
    currentAmount,
    topUpAmount: mode === VaultMode.PERIODIC_TOP_UP ? topUpAmount : undefined,
    topUpFrequency: mode === VaultMode.PERIODIC_TOP_UP ? topUpFrequency : undefined,
    durationMonths,
    rewardType,
    reason,
  };
}
