import { toNumber } from '@/lib/money';
import { type PaymentMethodId, paymentMethods } from '@/lib/payment-methods';
import { MIN_DEPOSIT_PHP, isValidLockPeriod } from '@/lib/vault-rules';

export type CreateVaultInput = {
  amount: number;
  lockMonths: number;
  goalLabel?: string;
  paymentMethod?: PaymentMethodId;
  idempotencyKey?: string;
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

export function validateCreateVaultRequest(body: unknown): CreateVaultInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required.');
  }

  const payload = body as Record<string, unknown>;
  const amount = toNumber(payload.amount, Number.NaN);
  const lockMonths = toNumber(payload.lockMonths, Number.NaN);

  if (!Number.isFinite(amount) || amount < MIN_DEPOSIT_PHP) {
    throw new Error(`The minimum deposit is ₱${MIN_DEPOSIT_PHP.toLocaleString('en-PH')}.`);
  }

  if (!Number.isFinite(lockMonths) || !isValidLockPeriod(lockMonths)) {
    throw new Error('Lock period must be 12 months or more, in 12-month steps.');
  }

  const goalLabel = optionalToken(payload.goalLabel, 80);
  const paymentMethodRaw = optionalToken(payload.paymentMethod, 32);
  let paymentMethod: PaymentMethodId | undefined;

  if (paymentMethodRaw) {
    const known = paymentMethods.find((method) => method.id === paymentMethodRaw);
    if (!known) {
      throw new Error('Choose a valid payment method.');
    }
    paymentMethod = known.id;
  }

  return {
    amount: Math.round(amount),
    lockMonths,
    goalLabel,
    paymentMethod,
    idempotencyKey: optionalToken(payload.idempotencyKey),
  };
}

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
