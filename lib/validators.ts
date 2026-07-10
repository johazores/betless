import { TopUpFrequency, VaultMode } from '@/lib/domain';
import { rewardOptions } from '@/lib/vault-options';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { toNumber } from '@/lib/money';
import { canPeriodicPlanReachTarget, getPlanReachMessage } from '@/lib/planning';

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

function requirePositiveNumber(value: unknown, field: string) {
  const numberValue = toNumber(value, Number.NaN);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(`${field} must be greater than zero.`);
  }

  return numberValue;
}

function requireNonNegativeNumber(value: unknown, field: string) {
  const numberValue = toNumber(value, Number.NaN);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${field} cannot be negative.`);
  }

  return numberValue;
}

function validateVaultMode(value: unknown) {
  if (value === VaultMode.ONE_TIME_LOCK || value === VaultMode.PERIODIC_TOP_UP) {
    return value;
  }

  throw new Error('Vault mode is invalid.');
}

function validateTopUpFrequency(value: unknown) {
  if (value === TopUpFrequency.WEEKLY || value === TopUpFrequency.MONTHLY) {
    return value;
  }

  throw new Error('Top-up frequency is invalid.');
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

  const mode = validateVaultMode(payload.mode);
  const targetAmount = requirePositiveNumber(payload.targetAmount, 'Target amount');
  const currentAmount = requireNonNegativeNumber(payload.currentAmount, 'Starting amount');
  const durationMonths = requirePositiveNumber(payload.durationMonths, 'Duration');
  const rewardType = requireString(payload.rewardType, 'Reward preference');
  const reason = typeof payload.reason === 'string' ? payload.reason.trim() : undefined;

  if (currentAmount > targetAmount) throw new Error('Starting amount cannot be higher than target amount.');
  if (durationMonths < 1 || durationMonths > 36) throw new Error('Duration must be between 1 and 36 months.');
  if (!rewardOptions.includes(rewardType)) throw new Error('Reward preference is invalid.');
  if (reason && reason.length > 280) throw new Error('Reason must be 280 characters or less.');

  if (mode === VaultMode.ONE_TIME_LOCK) {
    if (currentAmount !== targetAmount) {
      throw new Error('For one-time lock mode, the committed amount must match the target amount. Use periodic top-up if the user will add money over time.');
    }

    return {
      walletAddress,
      mode,
      targetAmount,
      currentAmount,
      durationMonths,
      rewardType,
      reason,
    };
  }

  const topUpAmount = requirePositiveNumber(payload.topUpAmount, 'Top-up amount');
  const topUpFrequency = validateTopUpFrequency(payload.topUpFrequency);

  if (topUpAmount > targetAmount) {
    throw new Error('Top-up amount should not be higher than the target amount.');
  }

  const durationWeeks = Math.max(1, Math.round(durationMonths * 4));

  if (!canPeriodicPlanReachTarget({ targetAmount, currentAmount, topUpAmount, durationWeeks, frequency: topUpFrequency })) {
    throw new Error(getPlanReachMessage({ targetAmount, currentAmount, topUpAmount, durationWeeks, frequency: topUpFrequency }));
  }

  return {
    walletAddress,
    mode,
    targetAmount,
    currentAmount,
    topUpAmount,
    topUpFrequency,
    durationMonths,
    rewardType,
    reason,
  };
}
