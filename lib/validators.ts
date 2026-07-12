import { toNumber } from '@/lib/money';
import {
  GOAL_PRESETS,
  MIN_DEPOSIT_PHP,
  MIN_LOCK_PERCENT,
  MAX_LOCK_PERCENT,
  REMITTANCE_MIN_LOCK_PHP,
  calculateRemittanceSplit,
  isValidLockPeriod,
  isValidLockPercent,
} from '@/lib/vault-rules';

export type CreateVaultInput = {
  amount: number;
  lockMonths: number;
  idempotencyKey?: string;
  goalName?: string;
  sourceAmount?: number;
  lockPercent?: number;
};

export function getSingleQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function optionalToken(value: unknown, maxLength = 200) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > maxLength) {
    throw new Error('Request key is invalid.');
  }
  return trimmed;
}

function optionalGoalName(value: unknown) {
  if (value == null) return undefined;
  if (typeof value !== 'string') {
    throw new Error('Goal name must be text.');
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > 60) {
    throw new Error('Goal name must be 60 characters or fewer.');
  }
  return trimmed;
}

export function validateCreateVaultRequest(body: unknown): CreateVaultInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required.');
  }

  const payload = body as Record<string, unknown>;
  const lockMonths = toNumber(payload.lockMonths, Number.NaN);
  const goalName = optionalGoalName(payload.goalName);

  if (!Number.isFinite(lockMonths) || !isValidLockPeriod(lockMonths)) {
    throw new Error('Lock period must be 12 months or more, in 12-month steps.');
  }

  const rawSourceAmount = payload.sourceAmount;
  const rawLockPercent = payload.lockPercent;
  const hasRemittanceSplit =
    rawSourceAmount != null || rawLockPercent != null;

  if (hasRemittanceSplit) {
    const sourceAmount = toNumber(rawSourceAmount, Number.NaN);
    const lockPercent = toNumber(rawLockPercent, Number.NaN);

    if (!Number.isFinite(sourceAmount) || sourceAmount < REMITTANCE_MIN_LOCK_PHP) {
      throw new Error(`Incoming amount must be at least ₱${REMITTANCE_MIN_LOCK_PHP.toLocaleString('en-PH')}.`);
    }

    if (!Number.isFinite(lockPercent) || !isValidLockPercent(lockPercent)) {
      throw new Error(`Lock percentage must be between ${MIN_LOCK_PERCENT}% and ${MAX_LOCK_PERCENT}%.`);
    }

    const { lockedAmount } = calculateRemittanceSplit(sourceAmount, lockPercent);

    if (lockedAmount < REMITTANCE_MIN_LOCK_PHP) {
      throw new Error(
        `The locked portion must be at least ₱${REMITTANCE_MIN_LOCK_PHP.toLocaleString('en-PH')}. Increase the lock percentage or incoming amount.`,
      );
    }

    return {
      amount: lockedAmount,
      lockMonths,
      idempotencyKey: optionalToken(payload.idempotencyKey),
      goalName,
      sourceAmount: Math.round(sourceAmount),
      lockPercent: Math.round(lockPercent),
    };
  }

  const amount = toNumber(payload.amount, Number.NaN);

  if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_PHP) {
    throw new Error(`The minimum deposit is ₱${MIN_DEPOSIT_PHP.toLocaleString('en-PH')}.`);
  }

  return {
    amount: Math.round(amount),
    lockMonths,
    idempotencyKey: optionalToken(payload.idempotencyKey),
    goalName,
  };
}

export { GOAL_PRESETS };

export function validateClaimReferralRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required.');
  }

  const code = (body as Record<string, unknown>).code;

  if (typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('Enter a referral code.');
  }

  return code.trim().toUpperCase();
}

export function validateRedeemRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required.');
  }

  const rewardId = (body as Record<string, unknown>).rewardId;

  if (typeof rewardId !== 'string' || rewardId.trim().length === 0) {
    throw new Error('Choose a reward to redeem.');
  }

  return rewardId.trim();
}
