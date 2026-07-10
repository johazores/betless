export const VaultStatus = {
  ACTIVE: 'ACTIVE',
  MATURED: 'MATURED',
  WITHDRAWN_EARLY: 'WITHDRAWN_EARLY',
} as const;

export type VaultStatus = (typeof VaultStatus)[keyof typeof VaultStatus];

export const PointsTransactionType = {
  MONTHLY_REWARD: 'MONTHLY_REWARD',
  REDEMPTION: 'REDEMPTION',
  REFERRAL_BONUS: 'REFERRAL_BONUS',
} as const;

export type PointsTransactionType = (typeof PointsTransactionType)[keyof typeof PointsTransactionType];

export type DecimalLike = {
  toNumber?: () => number;
  toString?: () => string;
};

export function decimalToNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);

  const decimalValue = value as DecimalLike | null | undefined;
  if (decimalValue && typeof decimalValue.toNumber === 'function') return decimalValue.toNumber();
  if (decimalValue && typeof decimalValue.toString === 'function') return Number(decimalValue.toString());

  return 0;
}
